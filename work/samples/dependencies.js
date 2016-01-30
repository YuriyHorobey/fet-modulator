module.exports = {
    "sample-component/sample-component":     {
        registrar: function () {
            function SampleComponentBuilder(a, b, c) {
                var sample2 = $L.resolvePseudo('sample2')(1, 2, 3);
                var ret = new SampleComponent(sample2, a, b, c);
                return ret;
            }

            $L.register('sample-component', SampleComponentBuilder);
            $L.map('comp', 'sample-component')
        }
    },
    "sample-component-2/sample-component-2": {
        registrar: function () {
            function SampleComponent2Builder(a, b, c) {
                var ret = new SampleComponent2(a, b, c);
                return ret;
            }

            $L.register('sample-component-2', SampleComponent2Builder);
            $L.map('sample2', 'sample-component-2')
        }
    }
}
