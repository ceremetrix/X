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
goog.provide('X.labelmap');

// requires
goog.require('X.volume');



/**
 * Pseudo-class for a X.labelmap which derives from X.volume and is used to
 * distinguish between a volume and a label map. An X.labelmap will never be
 * rendered separately - but an X.volume object can be used to display solely a
 * label map.
 *
 * @constructor
 * @extends X.volume
 */
X.labelmap = function(volume) {

  //
  // call the standard constructor of X.volume
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'labelmap';

  /**
   * The pointer to the associated volume.
   *
   * @type {!X.volume}
   * @protected
   */
  this._volume = volume;

  /**
   * The only color to show.
   *
   * @type {!Float32Array}
   * @protected
   */
  this._showOnlyColor = new Float32Array([-255, -255, -255, -255]);
  
  /**
   * The label ID for each pixel.  (The cluster number that the voxel belongs to)
   * In IJK format
   *
   * @type {?Array}
   * @protected
   */
  this._labelIDs = null;

  /**
   * The max label ID. AKA number of clusters
   *
   * @type {?number}
   * @protected
   */
  this._labelIDsMax = -Infinity;

  /**
   * The only label to show.
   *
   * @type {!Array}
   * @protected
   */
  this._showOnlyLabel = [];

};
// inherit from X.volume
goog.inherits(X.labelmap, X.volume);


/**
 * Re-show the slices or re-activate the volume rendering for this volume.
 *
 * @inheritDoc
 */
X.labelmap.prototype.modified = function() {

  // .. and fire our own modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = this;
  this.dispatchEvent(modifiedEvent);

  // call the X.volumes' modified method
  if (this._volume){
    this._volume.modified();
  }
};

// ---------------------------------
// LL added

/**
 * Set the label IDs attribute.  This maps voxels to their associated label id (ie cluster ID)
 *
 * @param {?Array} ids The array that contains labels (cluster IDs).
 * @throws {Error} If anything goes wrong.
 * @public
 */
X.labelmap.prototype.__defineSetter__('labelIDs', function(ids) {

  if (goog.isArrayLike(ids)) {
    if (ids.length == this._data.length) {
      // data is same size, put in ijk format
      var _arrayDims = this._volume._dimensions;
      var _ijk = new Array(_arrayDims[2]);
      var _num_per_slice = _arrayDims[1] * _arrayDims[0];
      var _pix_value = 0;
      var _i = 0;
      var _j = 0;
      var _k = 0;
      var _pointer = 0;
      var _max = -Infinity;

      for (_k = 0; _k < _arrayDims[2]; _k++) {
        // get current slice
        var _current_k = ids.subarray(_k * (_num_per_slice), (_k + 1)
            * _num_per_slice);
        // initiate data pointer
        var _data_pointer = 0;

        // allocate images        
        _ijk[_k] = new Array(_arrayDims[1]);

        for (_j = 0; _j < _arrayDims[1]; _j++) {
          // allocate images
          _ijk[_k][_j] = new ids.constructor(_arrayDims[0]);

          for (_i = 0; _i < _arrayDims[0]; _i++) {
            if (!isNaN(_current_k[_data_pointer])) {
              _pix_value = _current_k[_data_pointer];
            }
            _ijk[_k][_j][_i] = _pix_value;
            _max = Math.max(_max, _pix_value);
            _data_pointer++;
          }
        }
      }
      
      this._labelIDs = _ijk;
      this._labelIDsMax = _max;

      // set dirty flag for the current slice to force reslicing
      var xyz = 0;
      for (xyz = 0; xyz < 3; xyz++) {
        var currentIndex = 0;
        if (xyz == 0) {
          currentIndex = this._volume._indexX;          

        } else if (xyz == 1) {
          currentIndex = this._volume._indexY;
          
        } else if (xyz == 2) {
          currentIndex = this._volume._indexZ;
          
        }
        this._volume.sliceInfoChanged(xyz)
        //this._children[xyz]._children[parseInt(currentIndex, 10)]._dirty = true;
      }
      this.modified();
      
    }
    else {
      throw new Error('ID Array not of the same size as labelmap.')
    }
  }
  else {
    throw new Error('Not a valid assignemnt. Must be an array and of the same size.')
  }

});

/**
 * Get the label IDs array.
 *
 * @return {!Array} The array of label ids in IJK volume format
 * @public
 */
X.labelmap.prototype.__defineGetter__('labelIDs', function() {

  return this._labelIDs;
  
});

/**
 * Show only the label with the given value or color (RGBA 0..1). If null is passed,
 * show all labels.
 *
 * @param {?Array|number} label The label value or label color to show.
 * @throws {Error} If anything goes wrong.
 * @public
 */
X.labelmap.prototype.__defineSetter__('showOnlyColor', function(label) {

  var _color = [-1, -1, -1, -1];

  if (goog.isDefAndNotNull(label)) {

    if (goog.isArray(label) && label.length == 4) {

      // a color was passed, just use it
      _color = label;

    } else {

      // a label value was passed, convert it to a color
      if (!this._colortable) {

        // we do need a colortable
        throw new Error('No colortable assigned.');

      }

      // grab the RGBA color
      _color = this._colortable._map.get(label).slice(1,5);

    }

  }

  // the showOnlyColor is always an integer in the range 0..255 or -255 if no valid color
  this._showOnlyColor = new Float32Array([Math.floor(_color[0]*255),Math.floor(_color[1]*255),Math.floor(_color[2]*255),Math.floor(_color[3]*255)]);

});

/**
 * Show only the voxels that match the given label ID (ie Cluster ID). If null is passed,
 * show all labels.
 *
 * @param {?number} label The label value or clusterID to show.
 * @throws {Error} If anything goes wrong.
 * @public
 */
X.labelmap.prototype.__defineSetter__('showOnlyLabel', function(label) {

  if (goog.isDefAndNotNull(label)) {
    if (label > this._labelIDsMax) {
      throw new Error ('Cluster ID out of range.');
    }
    else if (this._showOnlyLabel.indexOf(label) > -1){
      var index = this._showOnlyLabel.indexOf(label);      
      this._showOnlyLabel.splice(index, 1);    
    } 
    else if (label == -255) {
      // show all
      this._showOnlyLabel = [];
    } 
    else {
      this._showOnlyLabel.push(label);
    }

    // set dirty flag for the current slice to force redraw in 3d
    var xyz = 0;
    for (xyz = 0; xyz < 3; xyz++) {
      var currentIndex = 0;
      if (xyz == 0) {
        currentIndex = this._volume._indexX;          

      } else if (xyz == 1) {
        currentIndex = this._volume._indexY;
        
      } else if (xyz == 2) {
        currentIndex = this._volume._indexZ;
        
      }
      this._children[xyz]._children[currentIndex]._texture._dirty = true;
      this._children[xyz].modified();
    }

  }

});

/**
 * Get the show only labels (clusters).
 *
 * @return {!Array} 
 * @public
 */
X.labelmap.prototype.__defineGetter__('showOnlyLabel', function(){

  return this._showOnlyLabel;

});

// --------------------------------------

// export symbols (required for advanced compilation and in particular the copy
// constructors with duck typing)
goog.exportSymbol('X.labelmap', X.labelmap);
