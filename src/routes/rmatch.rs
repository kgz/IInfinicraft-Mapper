use crate::models::element_maps::ElementMap;
use crate::models::elements::capitalize;
use crate::models::elements::Element;
use actix_web::web;
use actix_web::Result;
use diesel::sql_query;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct E {
    element: Element,
    parent1: Option<Box<E>>,
    parent2: Option<Box<E>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Resp {
    element: String,
}

pub fn get_element_matches(el: &Element) -> E {
	let mut el = el.clone();
	el.map = None;
    //base elements
    if el.id < 5 {
        return E {
            element: el.clone(),
            parent1: None,
            parent2: None,
        };
    }

    let matches = ElementMap::find_by_result_id(el.id);

    // println!("Matches: {:?}", matches);
    if matches.is_empty() {
        println!("No matches found {:?}", el.id);
        return E {
            element: el.clone(),
            parent1: None,
            parent2: None,
        };
    }

    let _match = matches[0].clone();

    let parent_1_id = _match.element_id.unwrap();
    let parent_2_id = _match.second_element_id.unwrap();

    let parent_1 = Element::find(parent_1_id);
    let parent_2 = Element::find(parent_2_id);

    if parent_1.is_err() && parent_2.is_err() {
        // println!("No parents found - {:?}", _match.element_id.unwrap());
        return E {
            element: el.clone(),
            parent1: None,
            parent2: None,
        };
    }

    let p1: Element = parent_1.unwrap();
    let p2: Element = parent_2.unwrap();

    if p1.id == el.id || p2.id == el.id {
        return E {
            element: el.clone(),
            parent1: None,
            parent2: None,
        };
    }

    if (p1.name == "Nothing" && p2.name == el.name) || (p2.name == "Nothing" && p1.name == el.name)
    {
        return E {
            element: el.clone(),
            parent1: None,
            parent2: None,
        };
    }

    let p1_matches: Option<Box<E>> = Some(Box::new(get_element_matches(&p1)));
    let p2_matches: Option<Box<E>> = Some(Box::new(get_element_matches(&p2)));

    E {
        element: el.clone(),
        parent1: p1_matches,
        parent2: p2_matches,
    }
}

pub async fn match_elements(path: web::Query<Resp>) -> Result<web::Json<E>> {
    let element_name = path.element.clone();
    let element = Element::find_by_name(&element_name.as_str());

    if element.is_err() {
        return Ok(web::Json(E {
            element: Element {
                id: 0,
                emoji: "🤷".to_string(),
                name: "Unknown".to_string(),
                is_new: Some(false),
				map: None,
            },
            parent1: None,
            parent2: None,
        }));
    }

	let element = element.unwrap();

	if element.map.is_none() {
		let mapping = get_element_matches(&element);
		// save to element
		let conn = &mut crate::modules::database::get_dbo();
		// let _ = sql_query(format!("UPDATE elements SET map = '{}' WHERE id = {}", serde_json::to_string(&mapping).unwrap(), element.id)).execute(conn);
		let c = Element::update_map(element.id, serde_json::to_string(&mapping).unwrap());
		// return mapping3
		return Ok(web::Json(mapping));
	}

	let mapping: E = serde_json::from_str(&element.map.unwrap()).unwrap();
	return Ok(web::Json(mapping));
}
