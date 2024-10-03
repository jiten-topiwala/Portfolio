<?php
/**
 * fPortfolio functions and definitions
 *
 * Set up the theme and provides some helper functions, which are used in the
 * theme as custom template tags. Others are attached to action and filter
 * hooks in WordPress to change core functionality.
 *
 * When using a child theme you can override certain functions (those wrapped
 * in a function_exists() call) by defining them first in your child theme's
 * functions.php file. The child theme's functions.php file is included before
 * the parent theme's file, so the child theme functions would be used.
 *
 * @link https://codex.wordpress.org/Theme_Development
 * @link https://codex.wordpress.org/Child_Themes
 *
 * Functions that are not pluggable (not wrapped in function_exists()) are
 * instead attached to a filter or action hook.
 *
 * For more information on hooks, actions, and filters,
 * {@link https://codex.wordpress.org/Plugin_API}
 *
 * @subpackage fPortfolio
 * @author tishonator
 * @since fPortfolio 1.0.0
 *
 */

/**
 * Set a constant that holds the theme's minimum supported PHP version.
 */
define( 'FPORTFOLIO_MIN_PHP_VERSION', '7.0' );

/**
 * Immediately after theme switch is fired we we want to check php version and
 * revert to previously active theme if version is below our minimum.
 */
add_action( 'after_switch_theme', 'fportfolio_test_for_min_php' );

/**
 * Switches back to the previous theme if the minimum PHP version is not met.
 */
function fportfolio_test_for_min_php() {

	// Compare versions.
	if ( version_compare( PHP_VERSION, FPORTFOLIO_MIN_PHP_VERSION, '<' ) ) {
		// Site doesn't meet themes min php requirements, add notice...
		add_action( 'admin_notices', 'fportfolio_min_php_not_met_notice' );
		// ... and switch back to previous theme.
		switch_theme( get_option( 'theme_switched' ) );
		return false;

	};
}

if ( ! function_exists( 'wp_body_open' ) ) {
        function wp_body_open() {
                do_action( 'wp_body_open' );
        }
}

/**
 * An error notice that can be displayed if the Minimum PHP version is not met.
 */
function fportfolio_min_php_not_met_notice() {
	?>
	<div class="notice notice-error is_dismissable">
		<p>
			<?php esc_html_e( 'You need to update your PHP version to run this theme.', 'fportfolio' ); ?> <br />
			<?php
			printf(
				/* translators: 1 is the current PHP version string, 2 is the minmum supported php version string of the theme */
				esc_html__( 'Actual version is: %1$s, required version is: %2$s.', 'fportfolio' ),
				PHP_VERSION,
				FPORTFOLIO_MIN_PHP_VERSION
			); // phpcs: XSS ok.
			?>
		</p>
	</div>
	<?php
}


require_once( trailingslashit( get_template_directory() ) . 'customize-pro/class-customize.php' );

if ( ! function_exists( 'fportfolio_setup' ) ) :
/**
 * fPortfolio setup.
 *
 * Set up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support post thumbnails.
 *
 */
function fportfolio_setup() {

	load_theme_textdomain( 'fportfolio', get_template_directory() . '/languages' );

	add_theme_support( "title-tag" );

	// Add support for Block Styles.
	add_theme_support( 'wp-block-styles' );

	add_theme_support( 'editor-styles' );

	// add the visual editor to resemble the theme style
	add_editor_style( 'css/editor-style.css' );

	// This theme uses wp_nav_menu() in two locations.
	register_nav_menus( array(
		'primary'   => __( 'Primary Menu', 'fportfolio' ),
		'footer'    => __( 'Footer Menu', 'fportfolio' ),
	) );

	// add Custom background				 
	add_theme_support( 'custom-background', 
				   array ('default-color'  => '#FFFFFF')
				 );

	add_theme_support( 'post-thumbnails' );

	global $content_width;
	if ( ! isset( $content_width ) )
		$content_width = 900;

	add_theme_support( 'automatic-feed-links' );

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'comment-form', 'comment-list',
	) );

	// add custom header
    add_theme_support( 'custom-header', array (
                       'default-image'          => '%s/images/custom-header.jpg',
                       'flex-height'            => true,
                       'flex-width'             => true,
                       'uploads'                => true,
                       'width'                  => 1200,
                       'height'                 => 560,
                       'default-text-color'        => '#000000',
                       'wp-head-callback'       => 'fportfolio_header_style',
                    ) );

    // add custom logo
    add_theme_support( 'custom-logo', array (
                       'width'                  => 75,
                       'height'                 => 75,
                       'flex-height'            => true,
                       'flex-width'             => true,
                    ) );

    // Define and register starter content to showcase the theme on new sites.
	$starter_content = array(

		'widgets' => array(
			'sidebar-widget-area' => array(
				'search',
				'recent-posts',
				'categories',
				'archives',
			),

			'footer-column-1-widget-area' => array(
				'recent-comments'
			),

			'footer-column-2-widget-area' => array(
				'recent-posts'
			),

			'footer-column-3-widget-area' => array(
				'calendar'
			),
		),

		'posts' => array(
			'home',
			'blog',
			'about',
			'contact'
		),

		// Default to a static front page and assign the front and posts pages.
		'options' => array(
			'show_on_front' => 'page',
			'page_on_front' => '{{home}}',
			'page_for_posts' => '{{blog}}',
		),

		// Set the front page section theme mods to the IDs of the core-registered pages.
		'theme_mods' => array(
			'fportfolio_slider_display' => 1,
			'fportfolio_slide1_image' => esc_url( get_template_directory_uri() . '/images/slider/1.jpg' ),
			'fportfolio_slide1_content' => _x( '<h2>Slide 1 Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><a href="#" title="Read more">Read more</a>', 'Theme starter content', 'fportfolio' ),
			'fportfolio_slide2_image' => esc_url( get_template_directory_uri() . '/images/slider/2.jpg' ),
			'fportfolio_slide2_content' => _x( '<h2>Slide 2 Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><a href="#" title="Read more">Read more</a>', 'Theme starter content', 'fportfolio' ),
			'fportfolio_slide3_image' => esc_url( get_template_directory_uri() . '/images/slider/3.jpg' ),
			'fportfolio_slide3_content' => _x( '<h2>Slide 3 Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><a href="#" title="Read more">Read more</a>', 'Theme starter content', 'fportfolio' ),
			'fportfolio_slide4_image' => esc_url( get_template_directory_uri() . '/images/slider/4.jpg' ),
			'fportfolio_slide4_content' => _x( '<h2>Slide 4 Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><a href="#" title="Read more">Read more</a>', 'Theme starter content', 'fportfolio' ),
			'fportfolio_slide5_image' => esc_url( get_template_directory_uri() . '/images/slider/5.jpg' ),
			'fportfolio_slide5_content' => _x( '<h2>Slide 5 Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><a href="#" title="Read more">Read more</a>', 'Theme starter content', 'fportfolio' ),
		),

		'nav_menus' => array(
			// Assign a menu to the "top" location.
			'top' => array(
				'name' => __( 'Top Menu', 'fportfolio' ),
				'items' => array(
					'link_home',
					'page_blog',
					'page_contact',
					'page_about',
				),
			),

			// Assign a menu to the "primary" location.
			'primary' => array(
				'name' => __( 'Primary Menu', 'fportfolio' ),
				'items' => array(
					'link_home',
					'page_blog',
					'page_contact',
					'page_about',
				),
			),

			// Assign a menu to the "footer" location.
			'footer' => array(
				'name' => __( 'Footer Menu', 'fportfolio' ),
				'items' => array(
					'link_home',
					'page_about',
					'page_blog',
					'page_contact',
				),
			),
		),
	);

	$starter_content = apply_filters( 'fportfolio_starter_content', $starter_content );
	add_theme_support( 'starter-content', $starter_content );
}
endif; // fportfolio_setup
add_action( 'after_setup_theme', 'fportfolio_setup' );

/**
 * the main function to load scripts in the fPortfolio theme
 * if you add a new load of script, style, etc. you can use that function
 * instead of adding a new wp_enqueue_scripts action for it.
 */
function fportfolio_load_scripts() {

	// load main stylesheet.
	wp_enqueue_style( 'font-awesome', get_template_directory_uri() . '/css/font-awesome.min.css', array( ) );
	wp_enqueue_style( 'animate-css', get_template_directory_uri() . '/css/animate.css', array( ) );
	wp_enqueue_style( 'fportfolio-style', get_stylesheet_uri(), array() );
	
	
	// Load thread comments reply script
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
	
	// Load Utilities JS Script
	wp_enqueue_script( 'viewportchecker', get_template_directory_uri() . '/js/viewportchecker.js',
			array( 'jquery', ) );
			
	wp_enqueue_script( 'fportfolio-js', get_template_directory_uri() . '/js/fportfolio.js', array( 'jquery', 'viewportchecker', ) );
	
	$data = array(
		'loading_effect' => ( get_theme_mod('fportfolio_animations_display', 1) == 1 ),
	);
	wp_localize_script('fportfolio-js', 'fportfolio_options', $data);


	wp_enqueue_script( 'jquery.resize', get_template_directory_uri() . '/js/jquery.resize.js', array( 'jquery' ) );
	wp_enqueue_script( 'jquery.waitforimages', get_template_directory_uri() . '/js/jquery.waitforimages.js', array( 'jquery' ) );
	wp_enqueue_script( 'modernizr', get_template_directory_uri() . '/js/modernizr.js', array( 'jquery' ) );
	wp_enqueue_script( 'jquery.carousel-3d', get_template_directory_uri() . '/js/jquery.carousel-3d.js', array( 'jquery' ) );
}

add_action( 'wp_enqueue_scripts', 'fportfolio_load_scripts' );



/**
 * Display website's logo image
 */
function fportfolio_show_website_logo_image_and_title() {

	if ( has_custom_logo() ) {

        the_custom_logo();
    }

    $header_text_color = get_header_textcolor();

    if ( 'blank' !== $header_text_color ) {
    
        echo '<div id="site-identity">';
        echo '<a href="' . esc_url( home_url('/') ) . '" title="' . esc_attr( get_bloginfo('name') ) . '">';
        echo '<h1 class="entry-title">' . esc_html( get_bloginfo('name') ) . '</h1>';
        echo '</a>';
        echo '<strong>' . esc_html( get_bloginfo('description') ) . '</strong>';
        echo '</div>';
    }
}

/**
 *	Displays the copyright text.
 */
function fportfolio_show_copyright_text() {

	$footerText = get_theme_mod('fportfolio_footer_copyright', null);

	if ( !empty( $footerText ) ) {

		echo esc_html( $footerText ) . ' | ';		
	}
}

/**
 *	widgets-init action handler. Used to register widgets and register widget areas
 */
function fportfolio_widgets_init() {
	
	// Register Sidebar Widget.
	register_sidebar( array (
						'name'	 		 =>	 __( 'Sidebar Widget Area', 'fportfolio'),
						'id'		 	 =>	 'sidebar-widget-area',
						'description'	 =>  __( 'The sidebar widget area', 'fportfolio'),
						'before_widget'	 =>  '',
						'after_widget'	 =>  '',
						'before_title'	 =>  '<div class="sidebar-before-title"></div><h3 class="sidebar-title">',
						'after_title'	 =>  '</h3><div class="sidebar-after-title"></div>',
					) );

	// Header Widget.
	register_sidebar( array (
						'name'	 		 =>	 __( 'Header Widget Area', 'fportfolio' ),
						'id'		 	 =>	 'portfolio-header-widget-area',
						'description'	 =>  __( 'The header widget area', 'fportfolio' ),
						'before_widget'	 =>  '',
						'after_widget'	 =>  '',
						'before_title'	 =>  '<h3>',
						'after_title'	 =>  '</h3>',
					) );

	// Header Widget.
	register_sidebar( array (
						'name'	 		 =>	 __( 'Header Below Main Menu', 'fportfolio' ),
						'id'		 	 =>	 'portfolio-header-below-menu-area',
						'description'	 =>  __( 'A widget area below header main menu', 'fportfolio' ),
						'before_widget'	 =>  '',
						'after_widget'	 =>  '',
						'before_title'	 =>  '<h3>',
						'after_title'	 =>  '</h3>',
					) );

	// Register Footer Column #1
	register_sidebar( array (
							'name'			 =>  __( 'Footer Column #1', 'fportfolio' ),
							'id' 			 =>  'footer-column-1-widget-area',
							'description'	 =>  __( 'The Footer Column #1 widget area', 'fportfolio' ),
							'before_widget'  =>  '',
							'after_widget'	 =>  '',
							'before_title'	 =>  '<h2 class="footer-title">',
							'after_title'	 =>  '</h2><div class="footer-after-title"></div>',
						) );
	
	// Register Footer Column #2
	register_sidebar( array (
							'name'			 =>  __( 'Footer Column #2', 'fportfolio' ),
							'id' 			 =>  'footer-column-2-widget-area',
							'description'	 =>  __( 'The Footer Column #2 widget area', 'fportfolio' ),
							'before_widget'  =>  '',
							'after_widget'	 =>  '',
							'before_title'	 =>  '<h2 class="footer-title">',
							'after_title'	 =>  '</h2><div class="footer-after-title"></div>',
						) );
	
	// Register Footer Column #3
	register_sidebar( array (
							'name'			 =>  __( 'Footer Column #3', 'fportfolio' ),
							'id' 			 =>  'footer-column-3-widget-area',
							'description'	 =>  __( 'The Footer Column #3 widget area', 'fportfolio' ),
							'before_widget'  =>  '',
							'after_widget'	 =>  '',
							'before_title'	 =>  '<h2 class="footer-title">',
							'after_title'	 =>  '</h2><div class="footer-after-title"></div>',
						) );
}

add_action( 'widgets_init', 'fportfolio_widgets_init' );

/**
 * Displays the slider
 */
function fportfolio_display_slider() {

	?>

	 <div data-carousel-3d="true">
		<?php
			// display slides
			for ( $i = 1; $i <= 5; ++$i ) {
					
					$defaultSlideImage = get_template_directory_uri().'/images/slider/' . $i .'.jpg';

					$slideContent = get_theme_mod( 'fportfolio_slide'.$i.'_content' );
					$slideImage = get_theme_mod( 'fportfolio_slide'.$i.'_image', $defaultSlideImage );
				?>		
					<?php if ($slideImage != '') : ?>
							<div class="slide" style="background-image: url('<?php echo esc_url( $slideImage ); ?>');">
								<?php echo $slideContent; ?>
							</div>
					<?php endif; ?>
<?php		} ?>
	</div><!-- [data-carousel-3d] -->
<?php 
}

function fportfolio_p_link( $i, $title = '' ) {

	if ( $title == '' ) {
		$title = sprintf( esc_html__('Page %s', 'fportfolio'), $i );
	}
	
	echo "<a class='page-numbers' href='", esc_url( get_pagenum_link( $i ) ), "' title='", esc_attr($title), "'>{$i}</a>";
}

if ( ! function_exists( 'fportfolio_sanitize_checkbox' ) ) :
	/**
	 * Sanitization callback for 'checkbox' type controls. This callback sanitizes `$checked`
	 * as a boolean value, either TRUE or FALSE.
	 *
	 * @param bool $checked Whether the checkbox is checked.
	 * @return bool Whether the checkbox is checked.
	 */
	function fportfolio_sanitize_checkbox( $checked ) {
		// Boolean check.
		return ( ( isset( $checked ) && true == $checked ) ? true : false );
	}
endif; // fportfolio_sanitize_checkbox

if ( ! function_exists( 'fportfolio_sanitize_html' ) ) :

	function fportfolio_sanitize_html( $html ) {
		return wp_kses_post( $html );
	}

endif; // fportfolio_sanitize_html

if ( ! function_exists( 'fportfolio_sanitize_url' ) ) :

	function fportfolio_sanitize_url( $url ) {
		return esc_url_raw( $url );
	}

endif; // fportfolio_sanitize_url

/**
 * Register theme settings in the customizer
 */
function fportfolio_customize_register( $wp_customize ) {
	
	/**
	 * Add Slider Section
	 */
	$wp_customize->add_section(
		'fportfolio_slider_section',
		array(
			'title'       => __( 'Slider', 'fportfolio' ),
			'capability'  => 'edit_theme_options',
		)
	);

	// Add display slider option
	$wp_customize->add_setting(
			'fportfolio_slider_display',
			array(
					'default'           => 0,
					'sanitize_callback' => 'fportfolio_sanitize_checkbox',
			)
	);

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'fportfolio_slider_display',
							array(
								'label'          => __( 'Display Slider on a Static Front Page', 'fportfolio' ),
								'section'        => 'fportfolio_slider_section',
								'settings'       => 'fportfolio_slider_display',
								'type'           => 'checkbox',
							)
						)
	);

	for ($i = 1; $i <= 5; ++$i) {
	
		$slideContentId = 'fportfolio_slide'.$i.'_content';
		$slideImageId = 'fportfolio_slide'.$i.'_image';
		$defaultSliderImagePath = get_template_directory_uri().'/images/slider/'.$i.'.jpg';
	
		// Add Slide Content
		$wp_customize->add_setting(
			$slideContentId,
			array(
				'sanitize_callback' => 'fportfolio_sanitize_html',
			)
		);
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, $slideContentId,
									array(
										'label'          => sprintf( esc_html__( 'Slide #%s Content', 'fportfolio' ), $i ),
										'section'        => 'fportfolio_slider_section',
										'settings'       => $slideContentId,
										'type'           => 'textarea',
										)
									)
		);
		
		// Add Slide Background Image
		$wp_customize->add_setting( $slideImageId,
			array(
				'default' => $defaultSliderImagePath,
				'sanitize_callback' => 'fportfolio_sanitize_url'
			)
		);

		$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, $slideImageId,
				array(
					'label'   	 => sprintf( esc_html__( 'Slide #%s Image', 'fportfolio' ), $i ),
					'section' 	 => 'fportfolio_slider_section',
					'settings'   => $slideImageId,
				) 
			)
		);
	}

	/**
	 * Add Footer Section
	 */
	$wp_customize->add_section(
		'fportfolio_footer_section',
		array(
			'title'       => __( 'Footer', 'fportfolio' ),
			'capability'  => 'edit_theme_options',
		)
	);
	
	// Add footer copyright text
	$wp_customize->add_setting(
		'fportfolio_footer_copyright',
		array(
		    'default'           => '',
		    'sanitize_callback' => 'sanitize_text_field',
		)
	);

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'fportfolio_footer_copyright',
        array(
            'label'          => __( 'Copyright Text', 'fportfolio' ),
            'section'        => 'fportfolio_footer_section',
            'settings'       => 'fportfolio_footer_copyright',
            'type'           => 'text',
            )
        )
	);
	
	/**
	 * Add Animations Section
	 */
	$wp_customize->add_section(
		'fportfolio_animations_display',
		array(
			'title'       => __( 'Animations', 'fportfolio' ),
			'capability'  => 'edit_theme_options',
		)
	);
	// Add display Animations option
	$wp_customize->add_setting(
			'fportfolio_animations_display',
			array(
					'default'           => 1,
					'sanitize_callback' => 'fportfolio_sanitize_checkbox',
			)
	);
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize,
						'fportfolio_animations_display',
							array(
								'label'          => __( 'Enable Animations', 'fportfolio' ),
								'section'        => 'fportfolio_animations_display',
								'settings'       => 'fportfolio_animations_display',
								'type'           => 'checkbox',
							)
						)
	);
}

add_action('customize_register', 'fportfolio_customize_register');

function fportfolio_header_style() {

    $header_text_color = get_header_textcolor();

    if ( ! has_header_image()
        && ( get_theme_support( 'custom-header', 'default-text-color' ) === $header_text_color
             || 'blank' === $header_text_color ) ) {

        return;
    }

    $headerImage = get_header_image();
?>
    <style type="text/css">
        <?php if ( has_header_image() ) : ?>

                #header-main-fixed {background-image: url("<?php echo esc_url( $headerImage ); ?>");}

        <?php endif; ?>

        <?php if ( get_theme_support( 'custom-header', 'default-text-color' ) !== $header_text_color
                    && 'blank' !== $header_text_color ) : ?>

                #header-main-fixed, #header-main-fixed h1.entry-title {color: #<?php echo sanitize_hex_color_no_hash( $header_text_color ); ?>;}

        <?php endif; ?>
    </style>
<?php

}

/**
 * Fix skip link focus in IE11.
 *
 * This does not enqueue the script because it is tiny and because it is only for IE11,
 * thus it does not warrant having an entire dedicated blocking script being loaded.
 *
 * @link https://git.io/vWdr2
 */
function fportfolio_skip_link_focus_fix() {
	// The following is minified via `terser --compress --mangle -- js/skip-link-focus-fix.js`.
	?>
	<script>
	/(trident|msie)/i.test(navigator.userAgent)&&document.getElementById&&window.addEventListener&&window.addEventListener("hashchange",function(){var t,e=location.hash.substring(1);/^[A-z0-9_-]+$/.test(e)&&(t=document.getElementById(e))&&(/^(?:a|select|input|button|textarea)$/i.test(t.tagName)||(t.tabIndex=-1),t.focus())},!1);
	</script>
	<?php
}
add_action( 'wp_print_footer_scripts', 'fportfolio_skip_link_focus_fix' );

function fportfolio_register_block_styles() {

	register_block_style(
		'core/button',
		array(
			'name'  => 'btn',
			'label' => __( 'Hover Effect', 'fportfolio' ),
		)
	);

	register_block_style(
		'core/group',
		array(
			'name'  => 'tgroup',
			'label' => __( 'Margin Bottom Space', 'fportfolio' ),
		)
	);

	register_block_style(
		'core/site-title',
		array(
			'name'  => 'tsitetitle',
			'label' => __( 'Bold', 'fportfolio' ),
		)
	);

	register_block_style(
		'core/post-title',
		array(
			'name'  => 'tposttitle',
			'label' => __( 'Bold', 'fportfolio' ),
		)
	);

	register_block_style(
		'core/social-link',
		array(
			'name'  => 'tsociallinks',
			'label' => __( 'Square', 'fportfolio' ),
		)
	);
}
add_action( 'init', 'fportfolio_register_block_styles' );

?>
