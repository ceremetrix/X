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
goog.provide('X.renderer2D');
// requires
goog.require('X.renderer');
goog.require('goog.math.Vec3');
goog.require('goog.vec.Vec4');


/**
 * Create a 2D renderer inside a given DOM Element.
 *
 * @constructor
 * @extends X.renderer
 */
X.renderer2D = function() {

  //
  // call the standard constructor of X.renderer
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'renderer2D';

  /**
   * The orientation of this renderer.
   *
   * @type {?string}
   * @protected
   */
  this._orientation = null;

  /**
   * The orientation index in respect to the
   * attached volume and its scan direction.
   *
   * @type {!number}
   * @protected
   */
  this._orientationIndex = -1;

  /**
   * The array of orientation colors.
   *
   * @type {!Array}
   * @protected
   */
  this._orientationColors = [];

  /**
   * A frame buffer for slice data.
   *
   * @type {?Element}
   * @protected
   */
  this._frameBuffer = null;

  /**
   * The rendering context of the slice frame buffer.
   *
   * @type {?Object}
   * @protected
   */
  this._frameBufferContext = null;

  /**
   * A frame buffer for label data.
   *
   * @type {?Element}
   * @protected
   */
  this._labelFrameBuffer = null;

  /**
   * The rendering context of the label frame buffer.
   *
   * @type {?Object}
   * @protected
   */
  this._labelFrameBufferContext = null;

  /**
   * The current slice width.
   *
   * @type {number}
   * @protected
   */
  this._sliceWidth = 0;

  /**
   * The current slice height.
   *
   * @type {number}
   * @protected
   */
  this._sliceHeight = 0;

  /**
   * The current slice width spacing.
   *
   * @type {number}
   * @protected
   */
  this._sliceWidthSpacing = 0;

  /**
   * The current slice height spacing.
   *
   * @type {number}
   * @protected
   */
  this._sliceHeightSpacing = 0;

  /**
   * The buffer of the current slice index.
   *
   * @type {!number}
   * @protected
   */
  this._currentSlice = -1;

  this._currentSliceId = -1;

  /**
   * The buffer of the current lower threshold.
   *
   * @type {!number}
   * @protected
   */
  this._lowerThreshold = -1;

  /**
   * The buffer of the current upper threshold.
   *
   * @type {!number}
   * @protected
   */
  this._upperThreshold = -1;

  /**
   * The buffer of the current w/l low value.
   *
   * @type {!number}
   * @protected
   */
  this._windowLow = -1;

  /**
   * The buffer of the current w/l high value.
   *
   * @type {!number}
   * @protected
   */
  this._windowHigh = -1;

  /**
   * The buffer of the showOnly labelmap color.
   *
   * @type {!Float32Array}
   * @protected
   */
  this._labelmapShowOnlyColor = new Float32Array([-255, -255, -255, -255]);

  /**
   * The buffer for current volume colortable (LL added)
   * 
   * @type {?string}
   * @protected
   */
  this._volumeColortable = null;

  /**
   * The buffer for current labelmap colortable (LL added)
   * 
   * @type {?string}
   * @protected
   */
  this._labelmapColortable = null;

  /**
   * The convention we follow to draw the 2D slices. TRUE for RADIOLOGY, FALSE for NEUROLOGY.
   *
   * @type {!boolean}
   * @protected
   */
  this._radiological = true;

  this._normalizedScale = 1;

};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);

/**
 * @inheritDoc
 */
X.renderer2D.prototype.remove = function(object) {

  // call the remove_ method of the superclass
  goog.base(this, 'remove', object);

  this._objects.remove(object);

  return true;

};
/**
 * Overload this function to execute code after scrolling has completed and just
 * before the next rendering call.
 *
 * @public
 */
X.renderer2D.prototype.onScroll = function() {

  // do nothing
};


/**
 * Overload this function to execute code after window/level adjustment has
 * completed and just before the next rendering call.
 *
 * @public
 */
X.renderer2D.prototype.onWindowLevel = function() {

  // do nothing
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.onScroll_ = function(event) {

  goog.base(this, 'onScroll_', event);

  // grab the current volume
  var _volume = this._topLevelObjects[0];

  // .. if there is none, exit right away
  if (!_volume) {

    return;

  }

  // switch between different orientations
  var _orientation = "";

  if (this._orientationIndex == 0) {

    _orientation = "indexX";

  } else if (this._orientationIndex == 1) {

    _orientation = "indexY";

  } else {

    _orientation = "indexZ";

  }

  if (event._up) {

    // yes, scroll up
    _volume[_orientation] = _volume[_orientation] + 1;

  } else {

    // yes, so scroll down
    _volume[_orientation] = _volume[_orientation] - 1;

  }

  // execute the callback
  eval('this.onScroll();');

  // .. and trigger re-rendering
  // this.render_(false, false);
};


/**
 * Performs window/level adjustment for the currently loaded volume.
 *
 * @param {!X.event.WindowLevelEvent} event The window/level event from the
 *          camera.
 */
X.renderer2D.prototype.onWindowLevel_ = function(event) {

  // grab the current volume
  var _volume = this._topLevelObjects[0];

  // .. if there is none, exit right away
  if (!_volume) {
    return;
  }

  // update window level
  var _old_window = _volume._windowHigh - _volume._windowLow;
  var _old_level = _old_window / 2;

  // shrink/expand window
  var _new_window = parseInt(_old_window + (_old_window / 15) * -event._window,
      10);

  // increase/decrease level
  var _new_level = parseInt(_old_level + (_old_level / 15) * event._level, 10);

  // TODO better handling of these cases
  if (_old_window == _new_window) {
    _new_window++;
  }
  if (_old_level == _new_level) {
    _new_level++;
  }

  // re-propagate
  _volume._windowLow -= parseInt(_old_level - _new_level, 10);
  _volume._windowLow -= parseInt(_old_window - _new_window, 10);
  _volume._windowLow = Math.max(_volume._windowLow, _volume._min);
  _volume._windowHigh -= parseInt(_old_level - _new_level, 10);
  _volume._windowHigh += parseInt(_old_window - _new_window, 10);
  _volume._windowHigh = Math.min(_volume._windowHigh, _volume._max);

  // execute the callback
  eval('this.onWindowLevel();');

};


/**
 * Get the orientation of this renderer. Valid orientations are 'x','y','z' or
 * null.
 *
 * @return {?string} The orientation of this renderer.
 */
X.renderer2D.prototype.__defineGetter__('orientation', function() {

  return this._orientation;

});


/**
 * Set the orientation for this renderer. Valid orientations are 'x','y' or 'z' or 'axial',
 * 'sagittal' or 'coronal'.
 *
 * AXIAL == Z
 * SAGITTAL == X
 * CORONAL == Y
 *
 * @param {!string} orientation The orientation for this renderer: 'x','y' or
 *          'z' or 'axial', 'sagittal' or 'coronal'.
 * @throws {Error} An error, if the given orientation was wrong.
 */
X.renderer2D.prototype.__defineSetter__('orientation', function(orientation) {

  orientation = orientation.toUpperCase();

  if (orientation == 'AXIAL') {

    orientation = 'Z';
    this._orientationIndex = 2;

  } else if (orientation == 'SAGITTAL') {

    orientation = 'X';
    this._orientationIndex = 0;

  } else if (orientation == 'CORONAL') {

    orientation = 'Y';
    this._orientationIndex = 1;

  }

  if (orientation != 'X' && orientation != 'Y' && orientation != 'Z') {

    throw new Error('Invalid orientation.');

  }

  this._orientation = orientation;

  var _volume = this._topLevelObjects[0];

});


/**
 * Get the convention of this renderer.
 *
 * @return {!boolean} TRUE if the RADIOLOGY convention is used, FALSE if the
 *                    NEUROLOGY convention is used.
 */
X.renderer2D.prototype.__defineGetter__('radiological', function() {

  return this._radiological;

});

X.renderer2D.prototype.__defineGetter__('normalizedScale', function() {

  return this._normalizedScale;

});

X.renderer2D.prototype.__defineGetter__('canvasWidth', function() {

  return this._canvas.width;

});

X.renderer2D.prototype.__defineGetter__('canvasHeight', function() {

  return this._canvas.height;

});

X.renderer2D.prototype.__defineGetter__('sliceWidth', function() {

  return this._sliceWidth;

});

X.renderer2D.prototype.__defineGetter__('sliceHeight', function() {

  return this._sliceHeight;

});


/**
 * Set the convention for this renderer. There is a difference between radiological and neurological
 * convention in terms of treating the coronal left and right.
 *
 * Default is the radiological convention.
 *
 * @param {!boolean} radiological TRUE if the RADIOLOGY convention is used, FALSE if the
 *                                NEUROLOGY convention is used.
 */
X.renderer2D.prototype.__defineSetter__('radiological', function(radiological) {

  this._radiological = radiological;

});


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  // make sure an orientation is configured
  if (!this._orientation) {

    throw new Error('No 2D orientation set.');

  }

  // call the superclass' init method
  goog.base(this, 'init', '2d');

  // use the background color of the container by setting transparency here
  this._context.fillStyle = "rgba(50,50,50,0)";

  // .. and size
  this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

  // create an invisible canvas as a framebuffer
  this._frameBuffer = goog.dom.createDom('canvas');
  this._labelFrameBuffer = goog.dom.createDom('canvas');

  //
  //
  // try to apply nearest-neighbor interpolation -> does not work right now
  // so we ignore it
  // this._labelFrameBuffer.style.imageRendering = 'optimizeSpeed';
  // this._labelFrameBuffer.style.imageRendering = '-moz-crisp-edges';
  // this._labelFrameBuffer.style.imageRendering = '-o-crisp-edges';
  // this._labelFrameBuffer.style.imageRendering = '-webkit-optimize-contrast';
  // this._labelFrameBuffer.style.imageRendering = 'optimize-contrast';
  // this._labelFrameBuffer.style.msInterpolationMode = 'nearest-neighbor';
    this._labelFrameBuffer.style.imageRendering = 'pixelated';

  // listen to window/level events of the camera
  goog.events.listen(this._camera, X.event.events.WINDOWLEVEL,
      this.onWindowLevel_.bind(this));

};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.onResize_ = function() {

  // call the super class
  goog.base(this, 'onResize_');

  // in 2D we also want to perform auto scaling
  this.autoScale_();

};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.resetViewAndRender = function() {

  // call the super class
  goog.base(this, 'resetViewAndRender');

  // .. and perform auto scaling
  this.autoScale_();

  // .. and reset the window/level
  var _volume = this._topLevelObjects[0];

  // .. if there is none, exit right away
  if (_volume) {

    _volume._windowHigh = _volume._max;
    _volume._windowLow = _volume._min;

  }
  // .. render
  // this.render_(false, false);
};
//-------------------------------
// LL added from D.B. version:
/**
 * @inheritDoc
 */
X.renderer2D.prototype.setColortable = function(index) {

    window.console.log('X.renderer2D.setColortable(' + index + ')');

    var _volume = this._topLevelObjects[0];

    if (index == 0)
	this._colArrayCURRENT = this._colArrayDEFAULT;
    if (index == 1)
	this._colArrayCURRENT = this._colArrayIDS;
    else if (index == 2)
	this._colArrayCURRENT = this._colArrayHEAT;

    this._colArrayChanged =  true;

};

X.renderer2D.prototype.setLabelmapColortable = function(index) {

    window.console.log('X.renderer2D.setLabelmapColortable(' + index + ')');

    var _volume = this._topLevelObjects[0];

    if (index == 0)
	this._labelArrayCURRENT = this._colArrayDEFAULT;
    if (index == 1)
	this._labelArrayCURRENT = this._colArrayIDS;
    else if (index == 2)
	this._labelArrayCURRENT = this._colArrayHEAT;

    this._labelArrayChanged =  true;

};

//---------------------------------

/**
 * Convenience method to get the index of the volume container for a given
 * orientation.
 *
 * @param {?string} targetOrientation The orientation required.
 * @return {!number} The index of the volume children.
 * @private
 */
X.renderer2D.prototype.volumeChildrenIndex_ = function(targetOrientation) {

  if (targetOrientation == 'X') {

    return 0;

  } else if (targetOrientation == 'Y') {


    return 1;

  } else {

    return 2;
  }
};


 /**
 * Get the existing X.object with the given id.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @public
 */
 X.renderer2D.prototype.update = function(object) {
    // update volume info
    this.update_(object);
    // force redraw
    this._currentSlice = -1;
 }

/**
 * @inheritDoc
 */
X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);

  // check if object already existed..
  var existed = false;
  if (this.get(object._id)) {

    // this means, we are updating
    existed = true;

  }

  if (!(object instanceof X.volume)) {

    // we only add volumes in the 2d renderer for now
    return;

  }

  // var id = object._id;
  // var texture = object._texture;
  var file = object._file;
  var labelmap = object._labelmap; // here we access directly since we do not
  // want to create one using the labelmap() singleton accessor

  var colortable = object._colortable;


  //
  // COLOR TABLE
  //
  if (goog.isDefAndNotNull(colortable) &&
      goog.isDefAndNotNull(colortable._file) && colortable._file._dirty) {

    // a colortable file is associated to this object and it is dirty..
    // start loading
    this._loader.load(colortable, object);

    return;

  }

  //
  // LABEL MAP
  //
  if (goog.isDefAndNotNull(labelmap) && goog.isDefAndNotNull(labelmap._file) &&
      labelmap._file._dirty) {

    // a labelmap file is associated to this object and it is dirty..
    // background: we always want to parse label maps first
    // run the update_ function on the labelmap object

    this.update_(labelmap);

    // jump out
    return;

  }

  

  //
  // VOLUME
  //
  // with multiple files
  if (goog.isDefAndNotNull(file) && goog.isArray(file)) {

    // this object holds multiple files, a.k.a it is a DICOM series
    // check if we already loaded all the files
    if (!goog.isDefAndNotNull(object.MRI)) {

      // no files loaded at all, start the loading
      var _k = 0;
      var _len = file.length;

      for (_k = 0; _k < _len; _k++) {

        // start loading of each file..
        this._loader.load(file[_k], object);

      }

      return;

    } else if (object.MRI.loaded_files != file.length) {

      // still loading
      return;

    }

    // just continue

  }

  // with one file
  else if (goog.isDefAndNotNull(file) && file._dirty) {

    // this object is based on an external file and it is dirty..
    // start loading..
    this._loader.load(object, object);

    return;

  }

  //
  // at this point the orientation of this renderer might have changed so we
  // should recalculate all the cached values

  // volume dimensions
  var _dim = object._dimensions;

  // check the orientation and store a pointer to the slices
  this._orientationIndex = this.volumeChildrenIndex_(this._orientation);

  // size
  this._slices = object._children[this._orientationIndex]._children;

  var _currentSlice = null;
  if (this._orientationIndex == 0) {

    _currentSlice = object['indexX'];

  } else if (this._orientationIndex == 1) {

    _currentSlice = object['indexY'];

  } else {

    _currentSlice = object['indexZ'];

  }

  var _width = object._children[this._orientationIndex]._children[_currentSlice]._iWidth;
  var _height = object._children[this._orientationIndex]._children[_currentSlice]._iHeight;
  // spacing
  this._sliceWidthSpacing = object._children[this._orientationIndex]._children[_currentSlice]._widthSpacing;
  this._sliceHeightSpacing = object._children[this._orientationIndex]._children[_currentSlice]._heightSpacing;

  // .. and store the dimensions
  this._sliceWidth = _width;
  this._sliceHeight = _height;

  // update the invisible canvas to store the current slice
  var _frameBuffer = this._frameBuffer;
  _frameBuffer.width = _width;
  _frameBuffer.height = _height;

  var _frameBuffer2 = this._labelFrameBuffer;
  _frameBuffer2.width = _width;
  _frameBuffer2.height = _height;

  // .. and the context
  this._frameBufferContext = _frameBuffer.getContext('2d');
  this._labelFrameBufferContext = _frameBuffer2.getContext('2d');

  // do the following only if the object is brand-new
  if (!existed) {

    this._objects.add(object);
    this.autoScale_();

  }

};


/**
 * Adjust the zoom (scale) to best fit the current slice.
 */
X.renderer2D.prototype.autoScale_ = function() {

  // let's auto scale for best fit
  var _wScale = this._width / (this._sliceWidth * this._sliceWidthSpacing);
  var _hScale = this._height / (this._sliceHeight * this._sliceHeightSpacing);

  var _autoScale = Math.min(_wScale, _hScale);

  // propagate scale (zoom) to the camera
  var _view = this._camera._view;
  _view[14] = _autoScale;

};


/**
 * Callback for slice navigation, f.e. to update sliders.
 *
 * @public
 */
X.renderer2D.prototype.onSliceNavigation = function() {

  // should be overloaded

};


/**
 * Convert viewport (canvas) coordinates to volume (index) coordinates.
 *
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @return {?Array} An array of [i,j,k] coordinates or null if out of frame.
 */
X.renderer2D.prototype.xy2ijk = function(x, y) {

  // un-zoom and un-offset
  // there get coordinates in a normla view

  var _volume = this._topLevelObjects[0];
  var _view = this._camera._view;
  var _currentSlice = null;

  var _sliceWidth = this._sliceWidth;
  var _sliceHeight = this._sliceHeight;
  var _sliceWSpacing = null;
  var _sliceHSpacing = null;

  // get current slice
  // which color?
  if (this._orientation == "Y") {
    _currentSlice = this._slices[parseInt(_volume['indexY'], 10)];
    _sliceWSpacing = _currentSlice._widthSpacing;
    _sliceHSpacing = _currentSlice._heightSpacing;
    this._orientationColors[0] = 'rgba(255,0,0,.3)';
    this._orientationColors[1] = 'rgba(0,0,255,.3)';

  } else if (this._orientation == "Z") {
    _currentSlice = this._slices[parseInt(_volume['indexZ'], 10)];
    _sliceWSpacing = _currentSlice._widthSpacing;
    _sliceHSpacing = _currentSlice._heightSpacing;
    this._orientationColors[0] = 'rgba(255,0,0,.3)';
    this._orientationColors[1] = 'rgba(0,255,0,.3)';

  } else {
    _currentSlice = this._slices[parseInt(_volume['indexX'], 10)];
    _sliceWSpacing = _currentSlice._heightSpacing;
    _sliceHSpacing = _currentSlice._widthSpacing;
    this._orientationColors[0] = 'rgba(0,255,0,.3)';
    this._orientationColors[1] = 'rgba(0,0,255,.3)';

    var _buf = _sliceWidth;
    _sliceWidth = _sliceHeight;
    _sliceHeight = _buf;
  }

  // padding offsets
  var _x = 1 * _view[12];
  var _y = -1 * _view[13]; // we need to flip y here

  // .. and zoom
  var _center = [this._width / 2, this._height / 2];

  // the slice dimensions in canvas coordinates
  var _sliceWidthScaled = _sliceWidth * _sliceWSpacing *
    this._normalizedScale;
  var _sliceHeightScaled = _sliceHeight * _sliceHSpacing *
    this._normalizedScale;

  // the image borders on the left and top in canvas coordinates
  var _image_left2xy = _center[0] - (_sliceWidthScaled / 2);
  var _image_top2xy = _center[1] - (_sliceHeightScaled / 2);

  // incorporate the padding offsets (but they have to be scaled)
  _image_left2xy += _x * this._normalizedScale;
  _image_top2xy += _y * this._normalizedScale;

  if(x>_image_left2xy && x < _image_left2xy + _sliceWidthScaled &&
    y>_image_top2xy && y < _image_top2xy + _sliceHeightScaled){

    var _xNorm = (x - _image_left2xy)/ _sliceWidthScaled;
    var _yNorm = (y - _image_top2xy)/ _sliceHeightScaled;

    _x = _xNorm*_sliceWidth;
    _y = _yNorm*_sliceHeight;
    var _z = _currentSlice._xyBBox[4];

    if (this._orientation == "X") {
      // invert cols
      // then invert x and y to compensate camera +90d rotation
      _x = _sliceWidth - _x;

      var _buf = _x;
      _x = _y;
      _y = _buf;

    }
    else if (this._orientation == "Y") {

      // invert cols
      _x = _sliceWidth - _x;

    }
    else if (this._orientation == "Z") {

      // invert all
      _x = _sliceWidth - _x;
      _y = _sliceHeight - _y;

    }

    // map indices to xy coordinates
    _x = _currentSlice._wmin + _x*_currentSlice._widthSpacing;// - _currentSlice._widthSpacing/2;
    _y = _currentSlice._hmin + _y*_currentSlice._heightSpacing;// - _currentSlice._heightSpacing/2;

    var _xyz = goog.vec.Vec4.createFloat32FromValues(_x, _y, _z, 1);
    var _ijk = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.multVec4(_currentSlice._XYToIJK, _xyz, _ijk);

    _ijk = [Math.floor(_ijk[0]),Math.floor(_ijk[1]),Math.floor(_ijk[2])];
    // why < 0??
    var _ras = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.multVec4(_currentSlice._XYToRAS, _xyz, _ras);

    var _dx = _volume._childrenInfo[0]._sliceNormal[0]*_ras[0]
      + _volume._childrenInfo[0]._sliceNormal[1]*_ras[1]
      + _volume._childrenInfo[0]._sliceNormal[2]*_ras[2]
      + _volume._childrenInfo[0]._originD;

    var _ix = Math.round(_dx/_volume._childrenInfo[0]._sliceSpacing);
     if(_ix >= _volume._childrenInfo[0]._nb){
       _ix = _volume._childrenInfo[0]._nb - 1;
     }
     else if(_ix < 0){
       _ix = 0;
      }


    var _dy = _volume._childrenInfo[1]._sliceNormal[0]*_ras[0]
      + _volume._childrenInfo[1]._sliceNormal[1]*_ras[1]
      + _volume._childrenInfo[1]._sliceNormal[2]*_ras[2]
      + _volume._childrenInfo[1]._originD;

    var _iy = Math.round(_dy/_volume._childrenInfo[1]._sliceSpacing);
    if(_iy >= _volume._childrenInfo[1]._nb){
       _iy = _volume._childrenInfo[1]._nb - 1;
    }
    else if(_iy < 0) {
      _iy = 0;
    }

    // get plane distance from the origin
    var _dz = _volume._childrenInfo[2]._sliceNormal[0]*_ras[0]
      + _volume._childrenInfo[2]._sliceNormal[1]*_ras[1]
      + _volume._childrenInfo[2]._sliceNormal[2]*_ras[2]
      + _volume._childrenInfo[2]._originD;

    var _iz = Math.round(_dz/_volume._childrenInfo[2]._sliceSpacing);
    if(_iz >= _volume._childrenInfo[2]._nb){
      _iz = _volume._childrenInfo[2]._nb - 1;
    }
    else if(_iz < 0){
      // translate origin by distance
      _iz = 0;
    }

    return [[_ix, _iy, _iz], [_ijk[0], _ijk[1], _ijk[2]], [_ras[0], _ras[1], _ras[2]]];
    }

  return null;
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.render_ = function(picking, invoked) {

  // call the render_ method of the superclass
  goog.base(this, 'render_', picking, invoked);

  // only proceed if there are actually objects to render
  var _objects = this._objects.values();

  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {

    // there is nothing to render
    // get outta here
    return;

  }

  var _volume = this._topLevelObjects[0];

  //LL added from D.B. version: puts in a big if(volume) statement:
  if(_volume){
      

    var _currentSlice = null;
    if (this._orientationIndex == 0) {

        _currentSlice = _volume['indexX'];

    } else if (this._orientationIndex == 1) {

        _currentSlice = _volume['indexY'];

    } else {

        _currentSlice = _volume['indexZ'];

    }
    
    //if slice do not exist yet, we have to set slice dimensions
    var _width2 = this._slices[parseInt(_currentSlice, 10)]._iWidth;
    var _height2 = this._slices[parseInt(_currentSlice, 10)]._iHeight;
    // spacing
    this._sliceWidthSpacing = this._slices[parseInt(_currentSlice, 10)]._widthSpacing;
    this._sliceHeightSpacing = this._slices[parseInt(_currentSlice, 10)]._heightSpacing;

    // .. and store the dimensions
    this._sliceWidth = _width2;
    this._sliceHeight = _height2;
    //
    // grab the camera settings

    //
    // viewport size
    var _width = this._width;
    var _height = this._height;

    // first grab the view matrix which is 4x4 in favor of the 3D renderer
    var _view = this._camera._view;

    // clear the canvas
    this._context.save();
    this._context.clearRect(-_width, -_height, 2 * _width, 2 * _height);
    this._context.restore();

    // transform the canvas according to the view matrix
    // .. this includes zoom
    this._normalizedScale = Math.max(_view[14], 0.0001);

    this._context.setTransform(this._normalizedScale, 0, 0, this._normalizedScale, 0, 0);

    // .. and pan
    // we need to flip y here
    var _x = 1 * _view[12];
    var _y = -1 * _view[13];
    //
    // grab the volume and current slice
    //

    var _labelmap = _volume._labelmap;
    var _labelmapShowOnlyColor = null;
    var _colortable = _volume._colortable;
    
    if (_labelmap) {

        // since there is a labelmap, get the showOnlyColor property
        _labelmapShowOnlyColor = _volume._labelmap._showOnlyColor;

    }

    // .. here is the current slice
    var _slice = this._slices[parseInt(_currentSlice, 10)];
    var _sliceData = _slice._texture._rawData;
    var _currentLabelMap = _slice._labelmap;
    var _labelData = null;
    if (_currentLabelMap) {

        _labelData = _currentLabelMap._rawData;

    }

    var _sliceWidth = this._sliceWidth;
    var _sliceHeight = this._sliceHeight;

    // LL added from D.B. version:
    var _currentSliceId = _slice._id;

    //
    // FRAME BUFFERING
    //
    var _imageFBContext = this._frameBufferContext;
    var _labelFBContext = this._labelFrameBufferContext;

    // grab the current pixels
    var _imageData = _imageFBContext
        .getImageData(0, 0, _sliceWidth, _sliceHeight);
    var _labelmapData = _labelFBContext.getImageData(0, 0, _sliceWidth,
        _sliceHeight);
    var _pixels = _imageData.data;
    var _labelPixels = _labelmapData.data;
    var _pixelsLength = _pixels.length;

    // threshold values
    var _maxScalarRange = _volume._max;
    var _lowerThreshold = _volume._lowerThreshold;
    var _upperThreshold = _volume._upperThreshold;
    var _windowLow = _volume._windowLow;
    var _windowHigh = _volume._windowHigh;

    var _volumeColortable = null;
    var _labelmapColortable = null; 
    if(goog.isDefAndNotNull(_volume._colortable)) {
      _volumeColortable = _volume._colortable.file;
    }
    if(goog.isDefAndNotNull(_volume._labelmap)) {
      _labelmapColortable = _volume._labelmap._colortable.file;
    }

    // caching mechanism
    // we need to redraw the pixels only
    // - if the _currentSlice has changed
    // - if the threshold has changed
    // - if the window/level has changed
    // - the labelmap show only color has changed
    // LL from D.B.: redraw if colArray or currentSliceId has changed
    var _redraw_required = (this._colArrayChanged == true ||
        this._labelArrayChanged == true ||
        this._volumeColortable != _volumeColortable ||
        this._labelmapColortable != _labelmapColortable ||
        this._currentSliceId != _currentSliceId ||
        this._currentSlice != _currentSlice ||
        this._lowerThreshold != _lowerThreshold ||
        this._upperThreshold != _upperThreshold ||
        this._windowLow != _windowLow || 
        this._windowHigh != _windowHigh || 
        (_labelmapShowOnlyColor && !X.array
        .compare(_labelmapShowOnlyColor, this._labelmapShowOnlyColor, 0, 0, 4)));

    if (_redraw_required) {
        this._colArrayChanged = true;
        this._labelArrayChanged = true;
        // update FBs with new size
        // has to be there, not sure why, too slow to be in main loop?
        var _frameBuffer = this._frameBuffer;
        _frameBuffer.width = _width2;
        _frameBuffer.height = _height2;

        var _frameBuffer2 = this._labelFrameBuffer;
        _frameBuffer2.width = _width2;
        _frameBuffer2.height = _height2;

        // loop through the pixels and draw them to the invisible canvas
        // from bottom right up
        // also apply thresholding
        var _index = 0;
        do {


        // default color and label is just transparent
          var _color = [0, 0, 0, 0];
          var _label = [0, 0, 0, 0];
          var _fac1 = _volume._max - _volume._min; // LL: WTF is this!!

          // grab the pixel intensity
          // slice data is normalized (probably shouldn't ?)
          // de-normalize it (get real value)
          //
          // LL custom code, similar to D.B. but important differences:
          //

          // apply window/level (already applied if colortable exists) <--nope
          var _window = _windowHigh - _windowLow;
          var _level = _window/2 + _windowLow;
          
          var _origIntensity = 0;
          var _origIntensityR = 0;
          var _origIntensityG = 0;
          var _origIntensityB = 0;
          var _origIntensityA = 0;

          if (_colortable){
            // Colortable for the volume
            // The intensity (texture) is already normalized from parser.js if colortable present,
            var colorTable = _colortable._map;
            var _intensity = _sliceData[_index];
            var norm_val = -Infinity;

            if(_intensity < _level - _window/2 ){
                  _origIntensity = 0;
                  _origIntensityR = 0;
                  _origIntensityG = 0;
                  _origIntensityB = 0;
                  _origIntensityA = 0; // should the alpha be 0 or 255?? -LL
            }
            else if(_intensity > _level + _window/2 ){
                  _origIntensity = 255;
                  _origIntensityR = 255;
                  _origIntensityG = 255;
                  _origIntensityB = 255;
                  _origIntensityA = 255;
            }
            else {
              // Give it time to load colortable and make sure map is defined
              if(colorTable.map_) {  
                if(_volume._parametric) {
                  // normalize the negative values between 0-127 (0:len(keys_)/2-1)
                  // positive values between 128 and 255 (len(keys_)/2 : 255)            
                  numColors = colorTable.keys_.length;
                  var _rangeMin = 0;
                  var _rangeMax = 0; 
                  
                  if (Math.round(_intensity) <= 0) {
                    _rangeMax = _windowLow;
                    _rangeMin = 0;
                    norm_val = Math.round((numColors/2)-1 - ((Math.abs(_intensity)-_rangeMin)*(-(numColors/2)-1)/(_windowLow - _rangeMin)));
                  }
                  else if(Math.round(_intensity) > 0){
                    _rangeMax = _windowHigh;
                    _rangeMin = 0;
                    norm_val = Math.round((numColors/2) + ((Math.abs(_intensity)-_rangeMin)*((numColors-1)-(numColors/2))/(_windowHigh - _rangeMin))); 
                  }              
                }
                else {
                    norm_val = Math.round(255 * (_intensity - _windowLow)/(_windowHigh - _windowLow));
                }
                if(goog.isDefAndNotNull(colorTable.get(norm_val))){
                  _origIntensityR = 255 * (colorTable.get(norm_val)[1]);
                  _origIntensityG = 255 * (colorTable.get(norm_val)[2]);
                  _origIntensityB = 255 * (colorTable.get(norm_val)[3]);
                  _origIntensityA = 255 * (colorTable.get(norm_val)[4]);
                }
                else {
                  _origIntensityR = 0;
                  _origIntensityG = 0;
                  _origIntensityB = 0;
                  _origIntensityA = 0;
                }                
              }
            }
          } 
          else{
              // No longer normalized in parser, so jus take intensity value:
              var _intensity = _sliceData[_index];
              var _intensityR = _sliceData[_index];
              var _intensityG = _sliceData[_index + 1];
              var _intensityB = _sliceData[_index + 2];
              var _intensityA = _sliceData[_index + 3];
          
              if(_intensity < _level - _window/2 ){
                  _origIntensity = 0;
                  _origIntensityR = 0;
                  _origIntensityG = 0;
                  _origIntensityB = 0;
                  _origIntensityA = 0; 
              }
              else if(_intensity > _level + _window/2 ){
                  _origIntensity = 255;
                  _origIntensityR = 255;
                  _origIntensityG = 255;
                  _origIntensityB = 255;
                  _origIntensityA = 255;
              }
              else{
                  _origIntensity  = Math.round(255 * (_intensity - (_level - _window / 2))/_window);
                  _origIntensityR = Math.round(255 * (_intensityR - (_level - _window / 2))/_window);
                  _origIntensityG = Math.round(255 * (_intensityG - (_level - _window / 2))/_window);
                  _origIntensityB = Math.round(255 * (_intensityB - (_level - _window / 2))/_window);
                  _origIntensityA = 255 
              }
            }
        

          // apply thresholding
          if (_intensity >= _lowerThreshold && _intensity <= _upperThreshold) {

              // current intensity is inside the threshold range so use the real intensity
              _color = [_origIntensityR,
                         _origIntensityG,
                         _origIntensityB,
                         _origIntensityA];

              if (_currentLabelMap) {

                // we have a label map here
                
                var _labelColortable = _labelmap._colortable;
                var label_colorTable = _labelColortable._map;
    
                var _labelmapOpacity = _labelmap._opacity; // LL added
                var _labelOpacity = _labelData[_index+ 3]; // or * _labelmapOpacity?
                var _labelVal = _labelData[_index];

                var _labelMin = _labelmap._min;
                var _labelMax = _labelmap._max;
                var _labelWindowLow = _labelmap._windowLow;
                var _labelWindowHigh = _labelmap._windowHigh;

                var lookup_val = -Infinity;

                if (_volume._labelmap._parametric) {
                  // normalize according to same logic as above 
                  var labelColors = label_colorTable.keys_.length;
                  var _rangeMin = 0;
                  var _rangeMax = 0; 
                  
                  if (Math.round(_labelVal) < 0) {
                    _rangeMin = _labelWindowLow;
                    _rangeMax = _labelmap._paramMin;
                    lookup_val = Math.round(((_labelVal)-_rangeMin)*((labelColors/2)-1)/(_rangeMax - _rangeMin));
                  }
                  else if(Math.round(_labelVal) > 0){
                    _rangeMax = _labelWindowHigh;
                    _rangeMin = _labelmap._paramMax;
                    lookup_val = Math.round((labelColors/2) + ((_labelVal-_rangeMin)*((labelColors-1)-(labelColors/2))/(_rangeMax - _rangeMin))); 
                  }              
                }
                else {
                    lookup_val = Math.round(255 * (_labelVal - _labelWindowLow)/(_labelWindowHigh - _labelWindowLow));
                }
                if(goog.isDefAndNotNull(label_colorTable.get(lookup_val))){
                  _labelR = 255 * (label_colorTable.get(lookup_val)[1]);
                  _labelG = 255 * (label_colorTable.get(lookup_val)[2]);
                  _labelB = 255 * (label_colorTable.get(lookup_val)[3]);
                  _labelA = 255 * (label_colorTable.get(lookup_val)[4]);
                }
                else {
                  _labelR = 0;
                  _labelG = 0;
                  _labelB = 0;
                  _labelA = 0;
                }
              
                // check if all labels are shown or only one
                if (_labelmapShowOnlyColor[3] == -255) {
                    // all labels are shown                           
                    _label = [_labelR, _labelG, _labelB, _labelA];

                } else {
                  // show only the label which matches in color
                  if (X.array.compare(_labelmapShowOnlyColor, _labelData, 0, _index, 4)) {
                    // this label matches
                    _label = [_labelR, _labelG, _labelB, _labelA];
                  }

                }
              }
          }

          if(this._orientation == "X"){
              // invert nothing
              _pixels[_index] = _color[0]; // r
              _pixels[_index + 1] = _color[1]; // g
              _pixels[_index + 2] = _color[2]; // b
              _pixels[_index + 3] = _color[3]; // a
              _labelPixels[_index] = _label[0]; // r
              _labelPixels[_index + 1] = _label[1]; // g
              _labelPixels[_index + 2] = _label[2]; // b
              _labelPixels[_index + 3] = _label[3]; // a
          }
          else if(this._orientation == "Y"){
              // invert cols
              var row = Math.floor(_index/(_sliceWidth*4));
              var col = _index - row*_sliceWidth*4;
              var invCol = 4*(_sliceWidth-1) - col ;
              var _invertedColsIndex = row*_sliceWidth*4 + invCol;
              _pixels[_invertedColsIndex] = _color[0]; // r
              _pixels[_invertedColsIndex + 1] = _color[1]; // g
              _pixels[_invertedColsIndex + 2] = _color[2]; // b
              _pixels[_invertedColsIndex + 3] = _color[3]; // a
              _labelPixels[_invertedColsIndex] = _label[0]; // r
              _labelPixels[_invertedColsIndex + 1] = _label[1]; // g
              _labelPixels[_invertedColsIndex + 2] = _label[2]; // b
              _labelPixels[_invertedColsIndex + 3] = _label[3]; // a
          }
          else{
              // invert all
              var _invertedIndex = _pixelsLength - 1 - _index;
              _pixels[_invertedIndex - 3] = _color[0]; // r
              _pixels[_invertedIndex - 2] = _color[1]; // g
              _pixels[_invertedIndex - 1] = _color[2]; // b
              _pixels[_invertedIndex] = _color[3]; // a
              _labelPixels[_invertedIndex - 3] = _label[0]; // r
              _labelPixels[_invertedIndex - 2] = _label[1]; // g
              _labelPixels[_invertedIndex - 1] = _label[2]; // b
              _labelPixels[_invertedIndex] = _label[3]; // a
          }

          _index += 4; // increase by 4 units for r,g,b,a

          } while (_index < _pixelsLength);

          // store the generated image data to the frame buffer context
          _imageFBContext.putImageData(_imageData, 0, 0);
          _labelFBContext.putImageData(_labelmapData, 0, 0);

          // cache the current slice index and other values
          // which might require a redraw
          this._currentSlice = _currentSlice;
          this._lowerThreshold = _lowerThreshold;
          this._upperThreshold = _upperThreshold;
          this._windowLow = _windowLow;
          this._windowHigh = _windowHigh;
          this._volumeColortable = _volumeColortable;

          if (_currentLabelMap) {

            // only update the setting if we have a labelmap
            this._labelmapShowOnlyColor = _labelmapShowOnlyColor;
            this._labelmapColortable = _labelmapColortable;

          }

    }

    //
    // the actual drawing (rendering) happens here
    //

    // draw the slice frame buffer (which equals the slice data) to the main
    // context
    this._context.globalAlpha = 1.0; // draw fully opaque}

    // move to the middle
    this._context.translate(_width / 2 /this._normalizedScale, _height / 2 /
        this._normalizedScale);

    // Rotate the Sagittal viewer
    if(this._orientation == "X") {

        this._context.rotate(Math.PI * 0.5);

        var _buf = _x;
        _x = _y;
        _y = -_buf;

    }

    var _offset_x = -_sliceWidth * this._sliceWidthSpacing / 2 + _x;
    var _offset_y = -_sliceHeight * this._sliceHeightSpacing / 2 + _y;

    // draw the slice
    this._context.drawImage(this._frameBuffer, _offset_x, _offset_y, _sliceWidth *
        this._sliceWidthSpacing, _sliceHeight * this._sliceHeightSpacing);

    // draw the labels with a configured opacity
    if (_currentLabelMap && _volume._labelmap._visible) {

        var _labelOpacity = 1; //_volume._labelmap._opacity
        this._context.globalAlpha = _labelOpacity; // draw transparent depending on
        // opacity
        this._context.drawImage(this._labelFrameBuffer, _offset_x, _offset_y,
            _sliceWidth * this._sliceWidthSpacing, _sliceHeight *
                this._sliceHeightSpacing);

    }

    // if enabled, show slice navigators
    if (this._config['SLICENAVIGATORS']) {
        this._canvas.style.cursor = "none";

        // but only if the shift key is down and the left mouse is not
        if (this._interactor._mouseInside && this._interactor._shiftDown &&
            !this._interactor._leftButtonDown) {

        var _mousePosition = this._interactor._mousePosition;

        // check if we are over the slice
        var ijk = this.xy2ijk(_mousePosition[0], _mousePosition[1]);

        if (ijk) {
            // // we are over the slice
            // update the volume
            _volume._indexX = ijk[0][0];
            _volume._indexY = ijk[0][1];
            _volume._indexZ = ijk[0][2];
            _volume.modified(false);

            this['onSliceNavigation']();

            // draw the navigators
            // see http://diveintohtml5.info/canvas.html#paths

            // in x-direction
            this._context.setTransform(1, 0, 0, 1, 0, 0);
            this._context.beginPath();
            this._context.moveTo(this._interactor._mousePosition[0], 0);
            this._context.lineTo(this._interactor._mousePosition[0],
                this._interactor._mousePosition[1] - 1);
            this._context.moveTo(this._interactor._mousePosition[0],
                this._interactor._mousePosition[1] + 1);
            this._context.lineTo(this._interactor._mousePosition[0],
                this._height);
            this._context.strokeStyle = this._orientationColors[0];
            this._context.stroke();
            this._context.closePath();

            // in y-direction
            this._context.beginPath();
            this._context.moveTo(0, this._interactor._mousePosition[1]);
            this._context.lineTo(this._interactor._mousePosition[0] - 1,
                this._interactor._mousePosition[1]);
            this._context.moveTo(this._interactor._mousePosition[0] + 1, this._interactor._mousePosition[1]);
            this._context.lineTo(this._width,
                this._interactor._mousePosition[1]);
            this._context.strokeStyle = this._orientationColors[1];
            this._context.stroke();
            this._context.closePath();

            // write ijk coordinates
            this._context.font = '10pt Arial';
            // textAlign aligns text horizontally relative to placement
            this._context.textAlign = 'left';
            // textBaseline aligns text vertically relative to font style
            this._context.textBaseline = 'top';
            this._context.fillStyle = 'white';
            this._context.fillText('RAS: ' + ijk[2][0].toFixed(2) + ', ' + ijk[2][1].toFixed(2) + ', ' + ijk[2][2].toFixed(2), 0, 0);

            var _value = 'undefined';
            var _valueLM = 'undefined';
            var _valueCT = 'undefined';
            if(typeof _volume._IJKVolume[ijk[1][2].toFixed(0)] != 'undefined' && typeof _volume._IJKVolume[ijk[1][2].toFixed(0)][ijk[1][1].toFixed(0)] != 'undefined'){
            _value = _volume._IJKVolume[ijk[1][2].toFixed(0)][ijk[1][1].toFixed(0)][ijk[1][0].toFixed(0)];
            if(_volume.hasLabelMap){
                _valueLM = _volume._labelmap._IJKVolume[ijk[1][2].toFixed(0)][ijk[1][1].toFixed(0)][ijk[1][0].toFixed(0)];
                if(_volume._labelmap._colorTable){
                _valueCT = _volume._labelmap._colorTable.get(_valueLM);
                if(typeof _valueCT != 'undefined'){
                _valueCT = _valueCT[0];
                }
                }
            }
            }
            // get pixel value
            this._context.fillText('Background:  ' + _value + ' ('+ ijk[1][0].toFixed(0) + ', ' + ijk[1][1].toFixed(0) + ', ' + ijk[1][2].toFixed(0) + ')', 0, 15);
            // if any label map
            if(_volume.hasLabelMap){
            this._context.fillText('Labelmap:  ' + _valueCT + ' ('+ _valueLM + ')', 0, 30);
            }

        }

        }
    else{
        this._canvas.style.cursor = "default";
    }
    }
  
      
  }
  else{
    window.console.log('NO VOLUME');
  };

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.onShowtime',
    X.renderer2D.prototype.onShowtime);
goog.exportSymbol('X.renderer2D.prototype.onRender',
    X.renderer2D.prototype.onRender);
goog.exportSymbol('X.renderer2D.prototype.onScroll',
    X.renderer2D.prototype.onScroll);
goog.exportSymbol('X.renderer2D.prototype.onWindowLevel',
    X.renderer2D.prototype.onWindowLevel);
goog.exportSymbol('X.renderer2D.prototype.get', X.renderer2D.prototype.get);
goog.exportSymbol('X.renderer2D.prototype.resetViewAndRender',
    X.renderer2D.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer2D.prototype.xy2ijk',
    X.renderer2D.prototype.xy2ijk);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
goog.exportSymbol('X.renderer2D.prototype.destroy',
    X.renderer2D.prototype.destroy);
goog.exportSymbol('X.renderer2D.prototype.onSliceNavigation', X.renderer2D.prototype.onSliceNavigation);

goog.exportSymbol('X.renderer2D.prototype.afterRender', X.renderer2D.prototype.afterRender);
goog.exportSymbol('X.renderer2D.prototype.resize', X.renderer2D.prototype.resize);

//LL added from D.B. version: yet to add 'update' or look at other changes
goog.exportSymbol('X.renderer2D.prototype.setColortable',
		  X.renderer2D.prototype.setColortable);
goog.exportSymbol('X.renderer2D.prototype.setLabelmapColortable',
		  X.renderer2D.prototype.setLabelmapColortable);
goog.exportSymbol('X.renderer2D.prototype.update',
      X.renderer2D.prototype.update);