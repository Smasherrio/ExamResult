#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, String, Address};

// Admin address - Set this to the authorized admin account
const ADMIN: &str = "GDY3TAJYMA5GTIETTSQLTSIUCEDEJJPXC2SBP2KUSFFKPLJVIMIICSP2";

#[contracttype]
pub struct ResultRecord {
    pub student_id: String,
    pub subject: String,
    pub marks: u32,
}

#[contracttype]
pub enum DataKey {
    Result(String, String), // (student_id, subject)
    Admin,
}

#[contract]
pub struct ExamResultContract;

#[contractimpl]
impl ExamResultContract {
    /// Initialize contract with admin address
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Store exam result - Only admin can call this
    pub fn add_result(
        env: Env,
        student_id: String,
        subject: String,
        marks: u32,
    ) {
        // Input validation
        if student_id.len() == 0 || student_id.len() > 100 {
            panic!("Invalid student_id length");
        }
        if subject.len() == 0 || subject.len() > 100 {
            panic!("Invalid subject length");
        }
        if marks > 100 {
            panic!("Marks cannot exceed 100");
        }

        // Get admin and verify authorization
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| {
                panic!("Admin not initialized. Call init() first.");
            });
        admin.require_auth();

        let key = DataKey::Result(student_id.clone(), subject.clone());
        let record = ResultRecord {
            student_id,
            subject,
            marks,
        };
        env.storage().instance().set(&key, &record);
    }

    /// Retrieve exam result - Anyone can read
    pub fn get_result(
        env: Env,
        student_id: String,
        subject: String,
    ) -> Option<ResultRecord> {
        // Input validation
        if student_id.len() == 0 || student_id.len() > 100 {
            panic!("Invalid student_id length");
        }
        if subject.len() == 0 || subject.len() > 100 {
            panic!("Invalid subject length");
        }

        let key = DataKey::Result(student_id, subject);
        env.storage().instance().get(&key)
    }
}