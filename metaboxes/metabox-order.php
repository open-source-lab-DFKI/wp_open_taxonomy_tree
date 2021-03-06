<?php

/**
 * Metabox Post Order
 */

add_action( 'load-post.php',     'taxonomytree_order_setup_post_meta_box' );
add_action( 'load-post-new.php', 'taxonomytree_order_setup_post_meta_box' );

function taxonomytree_order_setup_post_meta_box() {

    add_action( 'add_meta_boxes', 'taxonomytree_order_add_post_meta_box' );
    add_action( 'save_post', 'taxonomytree_order_save_post_meta', 10, 2 );
}

function taxonomytree_order_add_post_meta_box() {

    $tree_post_type = get_option( 'tree_post_type' );

    add_meta_box(
        'tree_order_post',
         esc_html__( 'Tree Order', 'tree' ),
        'taxonomytree_order_post_meta_box',
         $tree_post_type,
        'side',
        'default'
    );
}

function taxonomytree_order_post_meta_box( $post ) {

    $default   = 1;
    $post_meta = get_post_meta( $post->ID, 'tree_order', true);

    if ( ! $post_meta ) {
        $post_meta = $default;
    } ?>

    <p><?php wp_nonce_field( basename( __FILE__ ), 'tree_order_nonce' ); ?>
        <input type="number" name="tree_order_post" id="tree-order-post" value="<?php echo esc_attr( $post_meta ); ?>" class="tree-order-field" />
        <p class="description">
            <?php _e( 'Enter a number to structure the posts in your tree.', 'tree' ); ?>
        </p>
    </p>
<?php }

function taxonomytree_order_save_post_meta( $post_id, $post ) {

    if ( ! isset( $_POST['tree_order_nonce'] ) || ! wp_verify_nonce( $_POST['tree_order_nonce'], basename( __FILE__ ) ) ) {
        return;
    }

    $meta_key       = 'tree_order';
    $old_meta_value = get_post_meta( $post_id, $meta_key );
    $new_meta_value = isset( $_POST['tree_order_post'] ) ? $_POST['tree_order_post'] : '';

    if ( $old_meta_value && '' === $new_meta_value ) {
        delete_post_meta( $post_id, $meta_key );
    } elseif ( $new_meta_value !== $old_meta_value ) {
        update_post_meta( $post_id, $meta_key, $new_meta_value );
    }
}

/**
 * Metabox Term Order  
 *
 */

$tree_taxonomy  = get_option( 'tree_taxonomy' );

add_action( "{$tree_taxonomy}_add_form_fields", 'taxonomytree_order_add_term_field' );

function taxonomytree_order_add_term_field(){ ?>

    <div class="form-field tree-order-term-wrap">
        <label for="tree-order-term"> <?php _e( 'Tree Order', 'tree' ); ?> </label>
        <?php wp_nonce_field( basename( __FILE__ ), 'tree_order_term_nonce' ); ?>
        <input type="number" name="tree_order_term" id="tree-order-term" value="1" class="tree-order-field" />
        <p class="description">
            <?php _e( 'Enter a number to structure the catergories in your tree.', 'tree' ); ?>
        </p>
    </div>
<?php }

add_action( "{$tree_taxonomy}_edit_form_fields",'taxonomytree_order_edit_term_field' );

function taxonomytree_order_edit_term_field( $term ) {

    $default   = 1;
	$term_meta = get_term_meta( $term->term_id, 'tree_order', true );

    if ( ! $term_meta ) {
        $term_meta = $default;
    } ?>

	<tr class="form-field tree-order-term-wrap">
        <th scope="row"><label for="tree-order-term"><?php _e( 'Tree Order', 'tree' ); ?></label></th>
        <td>
            <?php wp_nonce_field( basename( __FILE__ ), 'tree_order_term_nonce' ); ?>
            <input type="number" name="tree_order_term" id="tree-order-term" value="<?php echo esc_attr( $term_meta ); ?>" class="tree-order-field" />
            <p class="description">
                <?php _e( 'Enter a number to structure the catergories in your tree.', 'tree' ); ?>
            </p>
		</td>
	</tr>
<?php }

add_action( "edited_{$tree_taxonomy}", 'taxonomytree_order_save_term_meta' );
add_action( "create_{$tree_taxonomy}", 'taxonomytree_order_save_term_meta' );

function taxonomytree_order_save_term_meta( $term_id ) {

    if ( ! isset( $_POST['tree_order_term_nonce'] ) || ! wp_verify_nonce( $_POST['tree_order_term_nonce'], basename( __FILE__ ) ) ){
        return;
    }

    $meta_key       = 'tree_order';
    $old_meta_value = get_term_meta( $term_id );
    $new_meta_value = isset( $_POST['tree_order_term'] ) ? $_POST['tree_order_term'] : '';

    if ( $old_meta_value && '' === $new_meta_value ) {
        delete_term_meta( $term_id, $meta_key );
    } elseif ( $old_meta_value !== $new_meta_value ) {
        update_term_meta( $term_id, $meta_key, $new_meta_value );
    }
} ?>
