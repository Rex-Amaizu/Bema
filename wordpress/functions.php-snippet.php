<?php
/**
 * Bema skills-test REST routes.
 *
 * Copy this file's contents into the active theme's functions.php in the local
 * wp-headless-test site. These public routes are for the local assessment only.
 */

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/submit-name', [
        'methods' => 'POST',
        'callback' => function ($request) {
            $name = sanitize_text_field($request->get_param('name'));
            $reversed = strrev($name);
            update_option('custom_name_submission', $reversed);

            return ['message' => 'Saved', 'reversed' => $reversed];
        },
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/get-name', [
        'methods' => 'GET',
        'callback' => function () {
            return ['reversed_name' => get_option('custom_name_submission', '')];
        },
        'permission_callback' => '__return_true',
    ]);

    // Compatibility route required by the assessment. Current EDD releases
    // document /edd-api/ rather than /wp-json/edd/v1/settings.
    register_rest_route('edd/v1', '/settings', [
        'methods' => 'GET',
        'callback' => function () {
            if (function_exists('edd_get_currency')) {
                $currency = edd_get_currency();
            } else {
                $settings = get_option('edd_settings', []);
                $currency = isset($settings['currency']) ? $settings['currency'] : 'USD';
            }

            return ['currency' => sanitize_text_field($currency)];
        },
        'permission_callback' => '__return_true',
    ]);
});
