use crate::{modules::database::get_dbo};
use diesel::{deserialize::FromSql, mysql::MysqlValue, prelude::*, sql_query, sql_types::{BigInt, BigSerial, Unsigned}};
use serde::{Deserialize, Serialize};
use crate::schema::elements;


#[derive(Serialize, Deserialize, Debug)]
pub struct E {
    element: Element,
    parent1: Option<Box<E>>,
    parent2: Option<Box<E>>,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Insertable, Clone, PartialEq, Eq, Hash)]
#[diesel(table_name = elements)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct Element {
    pub id: i32,
    pub emoji: String,
    pub name: String,
    pub is_new: Option<bool>,
	pub map: Option<String>,
	pub created_at: Option<chrono::NaiveDateTime>,
}

/// Capitalizes the first character in s.
pub fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
    }
}



impl Element {
    pub fn all() -> Vec<Element> {
        let conn = &mut get_dbo();
        elements::table.load(conn).unwrap()
    }

    pub fn find_by_name(name: &str) -> Result<Element, diesel::result::Error> {
        let conn = &mut get_dbo();
		let capatalized_name = capitalize(name);
		let lower_name = name.to_lowercase();
		let upper_name = name.to_uppercase();
        elements::table.filter(elements::name.eq_any(&[name, &capatalized_name, &lower_name, &upper_name])).first(conn)
    }

    pub fn create(new_element: Element) -> Element {
        let conn = &mut get_dbo();
        diesel::insert_into(elements::table)
            .values(&new_element)
            .execute(conn)
            .unwrap();

        elements::table.order(elements::id.desc()).first(conn).unwrap()
    }

    pub fn find(id: i32) -> Result<Element, diesel::result::Error> {
        let conn = &mut get_dbo();
        elements::table.find(id).first(conn)
    }

	pub fn update_map(id: i32, map: String) -> Result<Element, diesel::result::Error> {
		let conn = &mut get_dbo();
		diesel::update(elements::table.find(id))
			.set(elements::map.eq(map))
			.execute(conn)
			.unwrap();
		elements::table.find(id).first(conn)
	}


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


