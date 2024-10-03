<?php
/**
 * The template used for displaying page content
 *
 * @subpackage fPortfolio
 * @author tishonator
 * @since fPortfolio 1.0.0
 *
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<h1 class="entry-title">
		<?php echo get_the_title(); ?>
	</h1><!-- .entry-title -->

	<div class="page-content">
		<?php
			/**
			 * Display Thumbnails if thumbnail is set for the post
			 */
			if ( has_post_thumbnail() ) :

				the_post_thumbnail();

			endif;
			
			the_content( __( 'Read More...', 'fportfolio') );
		?>
	</div><!-- .page-content -->
	
	<div class="page-after-content">
		
		<?php if ( ! post_password_required() ) : ?>

			<?php if ('open' == $post->comment_status) : ?>

					<span class="icon comments-icon">
						<?php comments_popup_link(__( 'No Comments', 'fportfolio' ), __( '1 Comment', 'fportfolio' ), __( '% Comments', 'fportfolio' ), '', __( 'Comments are closed.', 'fportfolio' )); ?>
					</span><!-- .comments-icon -->

			<?php endif; ?>
				
			<?php edit_post_link( __( 'Edit', 'fportfolio' ), '<span class="edit-icon">', '</span>' ); ?>

		<?php endif; ?>

	</div><!-- .page-after-content -->
	
</article><!-- #post-## -->
