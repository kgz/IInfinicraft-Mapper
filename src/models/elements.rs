use crate::{modules::database::get_dbo};
use diesel::{deserialize::FromSql, mysql::MysqlValue, prelude::*, sql_types::{BigInt, BigSerial, Unsigned}};
use serde::{Deserialize, Serialize};
use crate::schema::elements;

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Insertable, Clone, PartialEq, Eq, Hash)]
#[diesel(table_name = elements)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct Element {
    pub id: i32,
    pub emoji: String,
    pub name: String,
    pub is_new: Option<bool>,
}



impl Element {
    pub fn all() -> Vec<Element> {
        let conn = &mut get_dbo();
        elements::table.load(conn).unwrap()
    }

    pub fn find_by_name(name: &str) -> Result<Element, diesel::result::Error> {
        let conn = &mut get_dbo();
        elements::table.filter(elements::name.eq(name)).first(conn)
    }

    pub fn create(new_element: Element) -> Element {
        let conn = &mut get_dbo();
        diesel::insert_into(elements::table)
            .values(&new_element)
            .execute(conn)
            .unwrap();

        elements::table.order(elements::id.desc()).first(conn).unwrap()
    }

    // pub fn find(id: i32) -> CronJob {
    //     let conn = &mut get_dbo();
    //     jobs::table.find(id).first(conn).unwrap()
    // }

    // pub fn create(title: String, description: String) -> CronJob {
    //     let new_job = CronJob {
    //         id: 0,
    //         title,
    //         description,
    //         created_at: None,
    //         deleted_at: None,
    //         deleted: None,
    //     };
    //     let conn = &mut get_dbo();

    //     diesel::insert_into(jobs::table)
    //         .values(&new_job)
    //         .execute(conn)
    //         .unwrap();

    //     jobs::table.order(jobs::id.desc()).first(conn).unwrap()
    // }

    // pub fn new(title: String, description: String) -> CronJob {
    //     CronJob {
    //         id: 0,
    //         title,
    //         description,
    //         created_at: None,
    //         deleted_at: None,
    //         deleted: None,
    //     }
    // }
}
