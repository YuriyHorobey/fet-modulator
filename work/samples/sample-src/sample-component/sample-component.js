/**
 * Created by yuriy.horobey on 2015-06-23.
 */
function SampleComponent(comp2) {
    return {
        test: test
    }
    function test() {
        dbg(comp2, 'comp2');
        comp2.test();
    }
}