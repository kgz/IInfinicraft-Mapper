use std::{fs::File, io::BufReader, path::PathBuf};

use actix_cors::Cors;
use actix_web::{http, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use rustls_pemfile::{certs, pkcs8_private_keys};
use serde::{Deserialize, Serialize};
use IInfinicraft_Mapper::{models::{element_maps::ElementMap, elements::Element}, routes::rmatch::match_elements};
use thirtyfour::prelude::*;
use fantoccini::{ClientBuilder, Locator};
use actix_web::{Result};
use IInfinicraft_Mapper::templates::index::index;
use rustls::{Certificate, PrivateKey, ServerConfig};
#[derive(Serialize, Deserialize, Debug)]
pub struct Resp {
    element1: String,
    element2: String,
    result: String,
    emoji: String,
    is_new: bool,
}

pub async fn add_to_db(path: web::Query<Resp>) -> Result<web::Json<Element>>  {
    // let element1 = req.match_info().get("element1");

    // get element1 from url params
    let element1 = path.element1.clone();
    let element2 = path.element2.clone();
    let result = path.result.clone();
    let emoji = path.emoji.clone();
    let is_new = path.is_new.clone();

    let result_exists_temp = Element::find_by_name(&result);
	let result_exists: Element;

    if result_exists_temp.is_err() {
        let new_element = Element {
            id: 0,
            emoji: emoji.clone(),
            name: result.clone().trim().to_string(),
            is_new: Some(is_new.clone()),
        };
        result_exists = Element::create(new_element);
    } else {
		result_exists = result_exists_temp.unwrap();
	}


    let mapping_exists = ElementMap::find_by_element_ids(&element1, &element2);

    if mapping_exists.is_err() {
        let new_element_map = ElementMap {
            id: 0,
            element_id: Some(Element::find_by_name(&element1).unwrap().id),
            second_element_id: Some(Element::find_by_name(&element2).unwrap().id),
            result: Some(result_exists.id),
        };
        ElementMap::create(new_element_map);
	} 
 
    // println!("Element1: {:?}", path);
    println!("Element1: {:?}, Element2: {:?}, Result: {}, Emoji: {}, Is New: {}", element1, element2, result, emoji, is_new);
	Ok(web::Json(result_exists))
}

pub async fn get_elements() -> Result<web::Json<Vec<Element>>> {
    let elements = Element::all();
    Ok(web::Json(elements))
}

pub async fn get_element_map() -> Result<web::Json<Vec<ElementMap>>> {
    let element_maps = ElementMap::all();
    Ok(web::Json(element_maps))
}


pub fn load_certs(cert: PathBuf, key: PathBuf) -> Result<ServerConfig, String> {
    let cert_file = &mut BufReader::new(File::open(&cert).map_err(|e| e.to_string())?);
    let key_file = &mut BufReader::new(File::open(&key).map_err(|e| e.to_string())?);

    let cert_chain = certs(cert_file)
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(Certificate)
        .collect();
    let mut keys: Vec<PrivateKey> = pkcs8_private_keys(key_file)
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(PrivateKey)
        .collect();

    if keys.is_empty() {
        return Err("Could not locate PKCS 8 private keys.".to_string());
    }

    let config = ServerConfig::builder()
        .with_safe_defaults()
        .with_no_client_auth();
    config
        .with_single_cert(cert_chain, keys.remove(0))
        .map_err(|e| e.to_string())
}


#[actix_web::main]
#[allow(unreachable_patterns)]
async fn main() {
    let server = HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("https://localhost")
            // .allowed_origin_fn(|origin, _req_head| origin.as_bytes().ends_with(b".rust-lang.org"))
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            // allow all

            .max_age(3600);

            App::new()
                .route("", web::get().to(index))
                .route("/", web::get().to(index))
                .service(
                    web::scope("/api")
                    .wrap(Cors::default().allow_any_origin().send_wildcard())
                        .route("/sync", web::get().to(add_to_db))
                        .route("/elements", web::get().to(get_elements))
                        .route("/element_maps", web::get().to(get_element_map))
                        .route("/match", web::get().to(match_elements))
						
            )
    }).bind_rustls(
        "0.0.0.0:2021",
        load_certs(
            std::env::current_dir().unwrap().join("localhost.pem"),
            std::env::current_dir().unwrap().join("localhost-key.pem"),
        )
        .unwrap(),
    )
    .unwrap();

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