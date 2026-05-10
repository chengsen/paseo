//! Cryptography primitives compatible with tweetnacl (TypeScript front-end).
//!
//! - Key exchange: Curve25519 (`curve25519-dalek` scalar multiplication)
//! - Encryption:   XSalsa20-Poly1305 (`crypto_secretbox::XSalsa20Poly1305`)
//!
//! Bundle format (binary): `[nonce (24 bytes)] [ciphertext + poly1305-mac]`
//! Transport format:       Base64 text over WebSocket.

use aead::{Aead, AeadCore, Key, KeyInit};
use base64::{engine::general_purpose, Engine as _};
use crypto_box::SecretKey;
use crypto_secretbox::XSalsa20Poly1305;
use curve25519_dalek::{montgomery::MontgomeryPoint, scalar::Scalar};
use rand::rngs::OsRng;

/// 32-byte public + secret key pair.
pub struct KeyPair {
    pub public_key: [u8; 32],
    pub secret_key: [u8; 32],
}

/// 32-byte shared key (output of `nacl.box.before`).
pub type SharedKey = [u8; 32];

const NONCE_LEN: usize = 24;

// ---------------------------------------------------------------------------
// Key generation / import / export
// ---------------------------------------------------------------------------

/// Generate a fresh Curve25519 key pair.
pub fn generate_keypair() -> KeyPair {
    let secret = SecretKey::generate(&mut OsRng);
    let public = secret.public_key();
    KeyPair {
        public_key: public.to_bytes(),
        secret_key: secret.to_bytes(),
    }
}

/// Encode a 32-byte public key as standard Base64.
pub fn export_public_key(public_key: &[u8; 32]) -> String {
    general_purpose::STANDARD.encode(public_key)
}

/// Decode a standard Base64 string into a 32-byte public key.
pub fn import_public_key(b64: &str) -> Result<[u8; 32], String> {
    let bytes = general_purpose::STANDARD
        .decode(b64)
        .map_err(|e| format!("base64 decode error: {}", e))?;
    if bytes.len() != 32 {
        return Err(format!("invalid public key length: {}", bytes.len()));
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&bytes);
    Ok(arr)
}

/// Encode a 32-byte secret key as standard Base64.
pub fn export_secret_key(secret_key: &[u8; 32]) -> String {
    general_purpose::STANDARD.encode(secret_key)
}

/// Decode a standard Base64 string into a 32-byte secret key.
pub fn import_secret_key(b64: &str) -> Result<[u8; 32], String> {
    let bytes = general_purpose::STANDARD
        .decode(b64)
        .map_err(|e| format!("base64 decode error: {}", e))?;
    if bytes.len() != 32 {
        return Err(format!("invalid secret key length: {}", bytes.len()));
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&bytes);
    Ok(arr)
}

// ---------------------------------------------------------------------------
// Shared-key derivation (Curve25519 scalar multiplication)
// ---------------------------------------------------------------------------

/// Derive a 32-byte shared key from our secret key and the peer's public key.
/// This is the Rust equivalent of `nacl.box.before(peerPublicKey, ourSecretKey)`.
pub fn derive_shared_key(secret_key: &[u8; 32], peer_public_key: &[u8; 32]) -> SharedKey {
    // crypto_box::SecretKey::from_bytes clamps the raw bytes before converting
    // to a Scalar. We must do the same to remain compatible.
    let clamped = curve25519_dalek::scalar::clamp_integer(*secret_key);
    let scalar = Scalar::from_bytes_mod_order(clamped);
    let point = MontgomeryPoint(*peer_public_key);
    let shared_point = scalar * point;
    *shared_point.as_bytes()
}

// ---------------------------------------------------------------------------
// XSalsa20-Poly1305 symmetric encrypt / decrypt
// ---------------------------------------------------------------------------

/// Encrypt `data` with the shared key and a random nonce.
///
/// Returns the binary bundle: `[nonce (24)] [ciphertext + poly1305-mac]`.
pub fn encrypt(shared_key: &SharedKey, data: impl AsRef<[u8]>) -> Vec<u8> {
    let key = Key::<XSalsa20Poly1305>::from_slice(shared_key);
    let cipher = XSalsa20Poly1305::new(key);
    let nonce = XSalsa20Poly1305::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, data.as_ref())
        .expect("XSalsa20-Poly1305 encryption failed");

    let mut out = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    out.extend_from_slice(&nonce);
    out.extend_from_slice(&ciphertext);
    out
}

/// Decrypt a binary bundle produced by `encrypt`.
///
/// The bundle format is: `[nonce (24)] [ciphertext + poly1305-mac]`.
pub fn decrypt(shared_key: &SharedKey, data: impl AsRef<[u8]>) -> Result<Vec<u8>, String> {
    let bytes = data.as_ref();
    if bytes.len() < NONCE_LEN {
        return Err("ciphertext bundle too short".into());
    }
    let (nonce_bytes, ciphertext) = bytes.split_at(NONCE_LEN);
    let nonce = aead::Nonce::<XSalsa20Poly1305>::from_slice(nonce_bytes);
    let key = Key::<XSalsa20Poly1305>::from_slice(shared_key);
    let cipher = XSalsa20Poly1305::new(key);
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "decryption failed (bad key or corrupted ciphertext)".into())
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keypair_roundtrip() {
        let kp = generate_keypair();
        assert_eq!(kp.public_key.len(), 32);
        assert_eq!(kp.secret_key.len(), 32);

        let pub_b64 = export_public_key(&kp.public_key);
        let sec_b64 = export_secret_key(&kp.secret_key);

        let pub_back = import_public_key(&pub_b64).unwrap();
        let sec_back = import_secret_key(&sec_b64).unwrap();

        assert_eq!(kp.public_key, pub_back);
        assert_eq!(kp.secret_key, sec_back);
    }

    #[test]
    fn shared_key_is_symmetric() {
        let alice = generate_keypair();
        let bob = generate_keypair();

        let sk_alice = derive_shared_key(&alice.secret_key, &bob.public_key);
        let sk_bob = derive_shared_key(&bob.secret_key, &alice.public_key);

        assert_eq!(sk_alice, sk_bob);
    }

    #[test]
    fn encrypt_decrypt_roundtrip() {
        let alice = generate_keypair();
        let bob = generate_keypair();
        let shared = derive_shared_key(&alice.secret_key, &bob.public_key);

        let plaintext = b"hello from paseo relay";
        let bundle = encrypt(&shared, plaintext.as_slice());

        // bundle = nonce(24) + ciphertext + mac(16)
        assert_eq!(bundle.len(), 24 + plaintext.len() + 16);

        let decrypted = decrypt(&shared, &bundle).unwrap();
        assert_eq!(decrypted, plaintext.as_slice());
    }

    #[test]
    fn decrypt_with_wrong_key_fails() {
        let alice = generate_keypair();
        let bob = generate_keypair();
        let shared = derive_shared_key(&alice.secret_key, &bob.public_key);

        let bundle = encrypt(&shared, b"secret");

        let evil = generate_keypair();
        let wrong_shared = derive_shared_key(&evil.secret_key, &bob.public_key);
        assert!(decrypt(&wrong_shared, &bundle).is_err());
    }

    #[test]
    fn decrypt_truncated_bundle_fails() {
        let shared: SharedKey = rand::random();
        let bundle = encrypt(&shared, b"x");
        assert!(decrypt(&shared, &bundle[..10]).is_err());
    }
}
