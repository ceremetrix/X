/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.mesh');

// requires
goog.require('X.object');



/**
 * Create a mesh. Meshes are displayable objects and can be loaded from a file.
 * 
 * @constructor
 * @extends X.object
 * @mixin X.loadable
 */
X.mesh = function() {

  //
  // call the standard constructor of X.object
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'mesh';

  /**
   * Whether the mesh is "parametric" ie z-scores
   * @type {boolean}
   * @public
   */
  this._parametric = false;
  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  
};
// inherit from X.object
goog.inherits(X.mesh, X.object);

/**
 * Get the parametric property
 * @public
 */
X.mesh.prototype.__defineGetter__('parametric', function() {

  return this._parametric;

})

/**
 * Set the parametric property
 * @param {boolean}
 * @public
 */
X.mesh.prototype.__defineSetter__('parametric', function(parametric) {

  this._parametric = parametric;

  // update the interpolation scheme of the scalars if they exist
  if (goog.isDefAndNotNull(this._scalars)) {
    this._scalars.interpolation = parametric;
  }
})

/**
 * Set the point colors for the mesh object if a colortable is present or given
 * @param {!X.colortable} colortable The X.colortable
 * @public
 */
X.mesh.prototype.setColors = function(colortable){
  if (!goog.isDefAndNotNull(colortable._map)) {
    if (!goog.isDefAndNotNull(this._colortable._map)) {
      // no colortable map supplied or already established, so jump out
      return;
    }
    else {
      var _colortable = this._colortable._map;
    } 
  } 
  else{
    var _colortable = colortable.map;
    this._colortable = colortable;
  }

  var _min = this._scalars._min;
  var _max = this._scalars._max;
  var _paramMin = this._scalars._paramMin;
  var _paramMax = this._scalars._paramMax;

  var _scalars = this._scalars;
  var _scalarsArray = this._scalars._glArray; // the scalars to assign color to
  var colors = new X.triplets(_scalarsArray.length);

  // loop through the scalars array, normalize between 0-255, and get rgb color
  // via colortable map lookup
  var numColors = _colortable.keys_.length; // number of colors in colortable

  for (var i = 0; i < _scalarsArray.length; i += 3) {
    var scalar = _scalarsArray[i];
    var param = this._parametric;
    var norm_scal = 0;

    if (!param) {
      // non-parametric, normalize from min to max 
      norm_scal = Math.round(255 * (scalar - _min)/( _max - _min));

    } else {
      // parametric -> scale negs from min to 0, pos from 0 to max:
      if (scalar <= 0) {
        norm_scal = Math.round((numColors/2)-1 - ((Math.abs(scalar) - _paramMin)* -((numColors/2)-1)/(_min - _paramMin)))
      } else {
        norm_scal = Math.round((numColors/2) + ((scalar - _paramMax)*((numColors-1)-(numColors/2))/(_max - _paramMax)));
      }
    }

    var _color = _colortable.get(norm_scal)
    if (goog.isDefAndNotNull(_color)) {
      colors.add(_color[1], _color[2], _color[3]); // (r, g, b)
    }
    else{
      colors.add(1,1,1);
    }    
  }

  this._colors = colors;
  this._colors._dirty = true;
  this._scalars._replaceMode = false;

  this.modified();
}

/**
 * Set the mesh to have one solid color
 * @param {!Array} array
 * @throws {Error} if array is not r,g,b, or if scalars are not present
 * @public
 */
X.mesh.prototype.setSolidColor = function(array) {
  if (array.length != 3) {
    throw new Error('Color must be [r,g,b] format');
  }
  if (!goog.isDefAndNotNull(this._scalars)) {
    throw new Error('There are no scalars for this object, use mesh.color setter instead');    
  }
  else {
    this._scalars._minColor = array;
    this._scalars._maxColor = array;
    this._scalars._replaceMode = true;
  }
}

// export symbols (required for advanced compilation)
goog.exportSymbol('X.mesh', X.mesh);
goog.exportSymbol('X.mesh.prototype.setColors', X.mesh.prototype.setColors);
goog.exportSymbol('X.mesh.prototype.setSolidColor', X.mesh.prototype.setSolidColor);
