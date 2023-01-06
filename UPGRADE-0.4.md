UPGRADE FROM 0.3 to 0.4
=======================

* If you used the exported `Promise` just remove that and use the native 
  NodeJS Promise functions. 
* If you use `nss-runfile.babel.js` you need to ensure that you remove
  `babel-register` and instead add `@babel/register` to your dependencies
