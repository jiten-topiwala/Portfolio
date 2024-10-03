<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'portfolio_v1' );

/** Database username */
define( 'DB_USER', 'jiten_topiwala' );

/** Database password */
define( 'DB_PASSWORD', '1234567890' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         's@d<EP~@ SI9U~9VzW*e=<.v^z_cjo+|H(cZz9-7EqEeuN|x0~eP~}+HYQmtya7Q' );
define( 'SECURE_AUTH_KEY',  'ac0 doKX<:s.&x]MB>cf{_wH{(V&p (ysF;V#{ f_yuB?#>wO$`Kg}c3y%VGfPgs' );
define( 'LOGGED_IN_KEY',    'L;A|KH>,K,EE^>h2-Mz;dgdI7@Jr{M/YlKlKqKe<U8c3jIz_tE@2u5m:wZv~d{|z' );
define( 'NONCE_KEY',        'ZuDu+(KAC_x0^Xh-UY._7WfHL?_x;+F,err<kU8}%a@.Fhp{~1(i^Hg_v$l2L5po' );
define( 'AUTH_SALT',        'Dd8n}O}IHM>(-JlTZUs~#zYU2UW[_;X<2,Ty{}%FIq,EG5!?)IA%|-KT~6Bp]e/k' );
define( 'SECURE_AUTH_SALT', 'cmAT)onhx[gZC7bmBNn2vE_@P~xVyj&w/A;3k(o[:KVE[wE&.c6,Wx uMBykS$Mh' );
define( 'LOGGED_IN_SALT',   'UWpA.pknPq,|5P[G>OHrH6%e#4=#iMnghvn*NR5o {Pj6.BTP0=|bV1l{+[*~CQn' );
define( 'NONCE_SALT',       '@|uR%()`(VyZt9mhQE1!`J W;[X&HQ|}>R%d|j]-s5%?-(z2vXju}YX&2A*,EE0u' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
