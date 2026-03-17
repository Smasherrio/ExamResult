#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, String};

#[contracttype]
pub struct ResultRecord {
    pub student_id: String,
    pub subject: String,
    pub marks: u32,
}

#[contract]
pub struct ExamResultContract;

#[contractimpl]
impl ExamResultContract {

    // Store exam result
    pub fn add_result(env: Env, student_id: String, subject: String, marks: u32) {
        let key = (Symbol::new(&env, "RESULT"), student_id.clone(), subject.clone());
        let record = ResultRecord {
            student_id,
            subject,
            marks,
        };
        env.storage().instance().set(&key, &record);
    }

    // Retrieve exam result
    pub fn get_result(env: Env, student_id: String, subject: String) -> ResultRecord {
        let key = (Symbol::new(&env, "RESULT"), student_id, subject);
        env.storage().instance().get(&key).unwrap()
    }
}