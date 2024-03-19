use std::collections::HashMap;

use actix_web::HttpRequest;
use actix_web::Result;
use maud::PreEscaped;
use maud::{html, Markup};

// use crate::resources::environment::Environments;
// use crate::resources::environment::APP_ENV;

pub async fn index() -> Result<Markup> {
    let is_debug = true;//APP_ENV.env == Environments::DEV;

    Ok(html!(
        html {
            head {
                title { "Hello" }
                @if is_debug {
                    script type="module" {
                    (PreEscaped("
                            console.log('Runnigng in dev mode')
                            window.dev = true;
                            import RefreshRuntime from 'https://localhost:3000/@react-refresh'
                            RefreshRuntime.injectIntoGlobalHook(window)
                            window.$RefreshReg$ = () => {}
                            window.$RefreshSig$ = () => (type) => type
                            window.__vite_plugin_react_preamble_installed__ = true;
                        "))
                    }
                    script defer type="module" src="https://localhost:3000/src/index.tsx" {}
                } @else {
                    script defer src="/static/index.min.js" {}
                    link rel="stylesheet" href="/static/index.min.css" {}
                }



            }
            body {
                // h1 { "Hello World!" }
                // p { "path: " (path) }
                // p { "is_debug: " (is_debug) }
                div id="root" {}
                // div {
                //     routes {
                //         @for (key, value) in routes {
                //             div {
                //                 h1 { (key) }
                //                 p { (value.description) }
                //             }
                //         }
                //     }
                // }
            }
        }
    ))
}
