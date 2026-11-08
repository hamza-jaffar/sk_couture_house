<?php

it('does not expose the removed customer page route', function () {
    $this->get('/dashboard/customers')
        ->assertNotFound();
});
