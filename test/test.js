// Force test environment
process.env.NODE_ENV = 'test';

module.exports = {
    'test String#length': function(beforeExit, assert) {
        assert.equal(6, 'foobar'.length);
    }
};