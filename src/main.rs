use actix_cors::Cors;
use actix_web::{http, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use IInfinicraft_Mapper::models::{element_maps::ElementMap, elements::Element};
use thirtyfour::prelude::*;
use fantoccini::{ClientBuilder, Locator};
use actix_web::{Result};

#[derive(Serialize, Deserialize, Debug)]
pub struct Resp {
    element1: String,
    element2: String,
    result: String,
    emoji: String,
    is_new: bool,
}

pub async fn add_to_db(path: web::Query<Resp>) -> HttpResponse {
    // let element1 = req.match_info().get("element1");

    // get element1 from url params
    let element1 = path.element1.clone();
    let element2 = path.element2.clone();
    let result = path.result.clone();
    let emoji = path.emoji.clone();
    let is_new = path.is_new.clone();

    let result_exists = Element::find_by_name(&result);

    if result_exists.is_err() {
        let new_element = Element {
            id: 0,
            emoji: emoji.clone(),
            name: result.clone(),
            is_new: Some(is_new.clone()),
        };
        Element::create(new_element);
    }


    let mapping_exists = ElementMap::find_by_element_ids(&element1, &element2);

    if mapping_exists.is_err() {
        let new_element_map = ElementMap {
            id: 0,
            element_id: Some(Element::find_by_name(&element1).unwrap().id),
            second_element_id: Some(Element::find_by_name(&element2).unwrap().id),
            result: Some(result.clone()),
        };
        ElementMap::create(new_element_map);
    }

    

    // println!("Element1: {:?}", path);
    println!("Element1: {:?}, Element2: {:?}, Result: {}, Emoji: {}, Is New: {}", element1, element2, result, emoji, is_new);
    HttpResponse::Ok().body("Added to db")
}

pub async fn get_elements() -> Result<web::Json<Vec<Element>>> {
    let elements = Element::all();
    Ok(web::Json(elements))
}

pub async fn get_element_map() -> Result<web::Json<Vec<ElementMap>>> {
    let element_maps = ElementMap::all();
    Ok(web::Json(element_maps))
}

#[actix_web::main]
#[allow(unreachable_patterns)]
async fn main() {


    let server = HttpServer::new(|| {
        // let cors = Cors::default()
        //     .allowed_origin("*")
        //     .allowed_origin_fn(|origin, _req_head| origin.as_bytes().ends_with(b".rust-lang.org"))
        //     .allowed_methods(vec!["GET", "POST"])
        //     .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
        //     .allowed_header(http::header::CONTENT_TYPE)
        //     .max_age(3600);

            App::new().wrap(Cors::default().allow_any_origin().send_wildcard())
                .route("/api/sync", web::get().to(add_to_db))
                .route("/api/elements", web::get().to(get_elements))
                .route("/api/element_maps", web::get().to(get_element_map))
            
               
        
    }).bind("0.0.0.0:2021").unwrap();

    println!("Server running on https://localhost:2020");
    server.run().await.unwrap();
    // cron.start();
}




#[derive(Deserialize, Debug)]
pub struct Response {
    emoji: String,
    isNew: bool,
    result: String,
}

pub async fn get_url(element1: &Element, element2: &Element) ->Result<Response, Box<dyn std::error::Error>> {
    let url = format!("https://neal.fun/api/infinite-craft/pair?first={:?}&second={:?}", element1, element2).replace(" ", "%20");
    // do get request
    let client = reqwest::Client::new();
    // set request geder :authority:neal.fun

    let body = client.get(&url).send().await?.text().await?; 
    println!("{}", body);
    let response: Response = serde_json::from_str(&body)?;

    Ok(response)

}