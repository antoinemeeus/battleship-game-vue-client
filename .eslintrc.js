module.exports = {
    extends: [
        'plugin:vue/recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    plugins: ['vue'],
    rules: {
        'no-unused-vars': 'off',
        'vue/no-side-effects-in-computed-properties': 'off'
    },
};