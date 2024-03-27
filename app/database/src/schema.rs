// @generated automatically by Diesel CLI.

diesel::table! {
    use diesel::sql_types::*;

    element_maps (id) {
        id -> Integer,
        element_id -> Nullable<Integer>,
        second_element_id -> Nullable<Integer>,
        result -> Nullable<Integer>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    elements (id) {
        id -> Integer,
        emoji -> Mediumtext,
        name -> Mediumtext,
        is_new -> Nullable<Bool>,
        map -> Nullable<Longtext>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(element_maps -> elements (result));

diesel::allow_tables_to_appear_in_same_query!(element_maps, elements,);
