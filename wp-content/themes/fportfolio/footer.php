<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the "body-content-wrapper" div and all content after.
 *
 * @subpackage fPortfolio
 * @author tishonator
 * @since fPortfolio 1.0.0
 *
 */
?>
			<a href="#" class="scrollup"></a>
			<footer id="footer-main">
			
				<div id="footer-content-wrapper">

					<?php get_sidebar('footer'); ?>
					
					<nav id="footer-menu">
						<?php wp_nav_menu( array( 'theme_location' => 'footer', ) ); ?>
					</nav>
					
				</div><!-- #footer-content-wrapper -->
				
			</footer>
			<div id="footer-bottom-area">
				<div id="footer-bottom-content-wrapper">
					<div id="copyright">
					
						<p>
						 	<?php fportfolio_show_copyright_text(); ?> <a href="<?php echo esc_url( 'https://tishonator.com/product/fportfolio' ); ?>" title="<?php esc_attr_e( 'fportfolio Theme', 'fportfolio' ); ?>">
							<?php esc_html_e('fPortfolio Theme', 'fportfolio'); ?></a> <?php esc_attr_e( 'powered by', 'fportfolio' ); ?> <a href="<?php echo esc_url( 'http://wordpress.org/' ); ?>" title="<?php esc_attr_e( 'WordPress', 'fportfolio' ); ?>">
							<?php esc_html_e('WordPress', 'fportfolio'); ?></a>
						</p>
						
					</div><!-- #copyright -->
				</div>
			</div><!-- #footer-main -->

		</div><!-- #body-content-wrapper -->
		<?php wp_footer(); ?>
	</body>
</html>