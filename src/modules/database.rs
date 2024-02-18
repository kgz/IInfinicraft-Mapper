use diesel::migration::{Migration, MigrationMetadata, MigrationSource};
use diesel::mysql::{Mysql, MysqlConnection};
use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use std::env;
use std::process::Command;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn get_dbo() -> MysqlConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    MysqlConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Migrations {
    pub name: String,
    pub key: String,
    pub description: String,
    pub ran: bool,
    origional_commit: String,
    // pub metadata: dyn MigrationMetadata,
}

pub fn get_migrations(conn: &mut impl MigrationHarness<Mysql>) -> Vec<Migrations> {
    // print out migrations
    println!(
        "Pending migrations: {}",
        conn.pending_migrations(MIGRATIONS).unwrap().len()
    );

    let run = conn.applied_migrations().unwrap();

    let mut migrations = Vec::new();
    for x in MigrationSource::<Mysql>::migrations(&MIGRATIONS)
        .unwrap()
        .into_iter()
    {
        let name = x.name();
        // key is first part of split on _ then replace - with nothing
        let key = name.to_owned().to_string();
        let key1 = key.split("_");
        let key2 = key1.clone().nth(0);

        if key2.is_none() {
            println!("key2 is none for: {}", key);
            continue;
        }

        let key3 = key2.unwrap().replace("-", "");

        let desc = key1.clone().nth(1);
        let mut has_been_run = false;

        for el in run.iter() {
            if el.to_string().eq(&key3.to_string()) {
                has_been_run = true;
                break;
            }
        }

        migrations.push(Migrations {
            name: name.to_string(),
            key: key3,
            description: desc.unwrap().to_string(),
            ran: has_been_run,
            origional_commit: String::from_utf8(get_file_creator(name.to_string())).unwrap(),
            // metadata: x.metadata(),
        })
    }

    migrations
}


fn get_file_creator(file_name: String) -> Vec<u8>{
    let path = format!("migrations/{}/down.sql", file_name);
    println!("path: {}", path);

    // get cwd
    let resp = Command::new("pwd")
        .output()
        .expect("failed to execute process");

    let cwd = String::from_utf8(resp.stdout).unwrap();
    // trim the newline
    let cwd = cwd.trim_end();

    let fullpath = format!("{}/{}", cwd, path);
    println!("fullpath: {}", fullpath);

    let cmd = format!("
        git log --follow --reverse  -- \"{}\" | head -n 1 | awk '{{print $2}}' | tr -d '\\n' | xargs -I {{}} git show {{}} -- \"{}\" | grep -E \"Author:\" | tr -d '\\n'
    ", fullpath, fullpath);

    let resp = Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .output()
        .expect("failed to execute process");
    resp.stdout
}
pub fn run_pending_migrations(conn: &mut impl MigrationHarness<Mysql>) {
    conn.run_pending_migrations(MIGRATIONS).unwrap();
}

pub fn revert_migration(conn: &mut impl MigrationHarness<Mysql>, name: &str) -> bool {
    
    for x in MigrationSource::<Mysql>::migrations(&MIGRATIONS)
        .unwrap()
        .into_iter()
    {
        if x.name().to_string().eq(name) {
            let r = conn.revert_migration(&x);
            if r.is_err() {
                return false;
            } else {
                println!("Migration reverted: {}", r.unwrap());
                return true;
            }
        }
    }
    println!("Migration not found: {}", name);
    false
   
}



//     let r = conn.run_migration(name).unwrap();
//     true
// }