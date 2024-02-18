use crate::{modules::database::get_dbo};
use diesel::{deserialize::FromSql, mysql::MysqlValue, prelude::*, sql_types::{BigInt, BigSerial, Unsigned}};
use serde::{Deserialize, Serialize};
use crate::schema::element_maps;

#[derive(Queryable, Selectable, Serialize, Deserialize, Insertable, Debug, Clone, PartialEq, Eq, Hash)]
#[diesel(table_name = element_maps)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
// element_maps (id) {
//     id -> Integer,
//     element_id -> Nullable<Integer>,
//     second_element_id -> Nullable<Integer>,
//     result -> Nullable<Text>,
// }
pub struct ElementMap {
    pub id: i32,
    pub element_id: Option<i32>,
    pub second_element_id: Option<i32>,
    pub result: Option<String>,
}



impl ElementMap {

    pub fn find_by_element_ids(element_name: &str, second_element_name: &str) -> Result<ElementMap, diesel::result::Error> {
        let conn = &mut get_dbo();
        let element = crate::models::elements::Element::find_by_name(element_name);
        let second_element = crate::models::elements::Element::find_by_name(second_element_name);
        let element_id = element.unwrap().id;
        let second_element_id = second_element.unwrap().id;
        element_maps::table.filter(element_maps::element_id.eq(element_id).and(element_maps::second_element_id.eq(second_element_id))).first(conn)
    }

    pub fn create(new_element_map: ElementMap) -> ElementMap {
        let conn = &mut get_dbo();
        diesel::insert_into(element_maps::table)
            .values(&new_element_map)
            .execute(conn)
            .unwrap();

        element_maps::table.order(element_maps::id.desc()).first(conn).unwrap()
    }
    // pub fn all() -> Vec<CronJob> {
    //     let conn = &mut get_dbo();
    //     jobs::table.load(conn).unwrap()
    // }

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
