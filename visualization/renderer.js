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
goog.provide('X.renderer');

// requires
goog.require('X.array');
goog.require('X.base');
goog.require('X.camera');
goog.require('X.camera2D');
goog.require('X.camera3D');
goog.require('X.cube');
goog.require('X.cylinder');
goog.require('X.event');
goog.require('X.interactor');
goog.require('X.interactor2D');
goog.require('X.interactor3D');
goog.require('X.labelmap');
goog.require('X.loader');
goog.require('X.object');
goog.require('X.progressbar');
goog.require('X.sphere');
goog.require('X.volume');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.Timer');



/**
 * The superclass for all renderers.
 *
 * @constructor
 * @extends X.base
 */
X.renderer = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'renderer';

  /**
   * The HTML container of this renderer, E.g. a <div>.
   *
   * @type {!Element|HTMLBodyElement}
   * @protected
   */
  this._container = window.document.body;

  /**
   * The width of this renderer.
   *
   * @type {!number}
   * @public
   */
  this._width = this._container.clientWidth;

  /**
   * The height of this renderer.
   *
   * @type {!number}
   * @public
   */
  this._height = this._container.clientHeight;

  /**
   * The Canvas of this renderer.
   *
   * @type {?Element}
   * @public
   */
  this._canvas = null;

  /**
   * The camera of this renderer.
   *
   * @type {?X.camera}
   * @protected
   */
  this._camera = null;

  /**
   * The interactor of this renderer.
   *
   * @type {?X.interactor}
   * @protected
   */
  this._interactor = null;

  /**
   * An X.array containing the displayable objects of this renderer. The object
   * reflects the rendering order for the associated objects.
   *
   * @type {!X.array}
   * @protected
   */
  this._objects = new X.array(X.object.OPACITY_COMPARATOR);

  /**
   * An array containing the topLevel objects (which do not have parents) of
   * this renderer.
   *
   * @type {!Array}
   * @protected
   */
  this._topLevelObjects = new Array();

  /**
   * The loader associated with this renderer.
   *
   * @type {?X.loader}
   * @protected
   */
  this._loader = null;

  /**
   * A locked flag for synchronizing.
   *
   * @type {boolean}
   * @protected
   */
  this._locked = false;

  /**
   * A flag to show if the initial loading was completed.
   *
   * @type {boolean}
   * @protected
   */
  this._loadingCompleted = false;

  /**
   * A flag to indicate that the onShowtime callback is about to be called.
   *
   * @type {boolean}
   * @protected
   */
  this._onShowtime = false;

  /**
   * The progressBar of this renderer.
   *
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar = null;

  /**
   * The progressBar for computing progress.
   *
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar2 = null;

  /**
   * The rendering context of this renderer.
   *
   * @type {?Object}
   * @protected
   */
  this._context = null;

  /**
   * The configuration of this renderer.
   *
   * @enum {boolean}
   */
  this._config = {
    'PROGRESSBAR_ENABLED': true,
    'INTERMEDIATE_RENDERING': false,
    'SLICENAVIGATORS': true
  };

  // LL added from D.B. version:-------
  // 256 color heat map:

  this._colArrayHEAT = [[0, 0, 0, 0], 
      [0, 0, 134.5125, 255], 
      [0, 0, 138.975, 255], 
      [0, 0, 143.4375, 255], 
      [0, 0, 147.9, 255], 
      [0, 0, 152.3625, 255], 
      [0, 0, 156.825, 255], 
      [0, 0, 161.2875, 255], 
      [0, 0, 165.75, 255], 
      [0, 0, 170.2125, 255], 
      [0, 0, 174.675, 255], 
      [0, 0, 179.1375, 255], 
      [0, 0, 183.6, 255], 
      [0, 0, 188.0625, 255], 
      [0, 0, 192.525, 255], 
      [0, 0, 196.9875, 255], 
      [0, 0, 201.45, 255], 
      [0, 0, 205.9125, 255], 
      [0, 0, 210.375, 255], 
      [0, 0, 214.8375, 255], 
      [0, 0, 219.3, 255], 
      [0, 0, 223.7625, 255], 
      [0, 0, 228.225, 255], 
      [0, 0, 232.6875, 255], 
      [0, 0, 237.15, 255], 
      [0, 0, 241.6125, 255], 
      [0, 0, 246.075, 255], 
      [0, 0, 250.5375, 255], 
      [0, 0, 255, 255], 
      [0, 3.984375, 255, 255], 
      [0, 7.96875, 255, 255], 
      [0, 11.953125, 255, 255], 
      [0, 15.9375, 255, 255], 
      [0, 19.921875, 255, 255], 
      [0, 23.90625, 255, 255], 
      [0, 27.890625, 255, 255], 
      [0, 31.875, 255, 255], 
      [0, 35.859375, 255, 255], 
      [0, 39.84375, 255, 255], 
      [0, 43.828125, 255, 255], 
      [0, 47.8125, 255, 255], 
      [0, 51.796875, 255, 255], 
      [0, 55.78125, 255, 255], 
      [0, 59.765625, 255, 255], 
      [0, 63.75, 255, 255], 
      [0, 67.734375, 255, 255], 
      [0, 71.71875, 255, 255], 
      [0, 75.703125, 255, 255], 
      [0, 79.6875, 255, 255], 
      [0, 83.671875, 255, 255], 
      [0, 87.65625, 255, 255], 
      [0, 91.640625, 255, 255], 
      [0, 95.625, 255, 255], 
      [0, 99.609375, 255, 255], 
      [0, 103.59375, 255, 255], 
      [0, 107.578125, 255, 255], 
      [0, 111.5625, 255, 255], 
      [0, 115.546875, 255, 255], 
      [0, 119.53125, 255, 255], 
      [0, 123.515625, 255, 255], 
      [0, 127.5, 255, 255], 
      [0, 131.484375, 255, 255], 
      [0, 135.46875, 255, 255], 
      [0, 139.453125, 255, 255], 
      [0, 143.4375, 255, 255], 
      [0, 147.421875, 255, 255], 
      [0, 151.40625, 255, 255], 
      [0, 155.390625, 255, 255], 
      [0, 159.375, 255, 255], 
      [0, 163.359375, 255, 255], 
      [0, 167.34375, 255, 255], 
      [0, 171.328125, 255, 255], 
      [0, 175.3125, 255, 255], 
      [0, 179.296875, 255, 255], 
      [0, 183.28125, 255, 255], 
      [0, 187.265625, 255, 255], 
      [0, 191.25, 255, 255], 
      [0, 195.234375, 255, 255], 
      [0, 199.21875, 255, 255], 
      [0, 203.203125, 255, 255], 
      [0, 207.1875, 255, 255], 
      [0, 211.171875, 255, 255], 
      [0, 215.15625, 255, 255], 
      [0, 219.140625, 255, 255], 
      [0, 223.125, 255, 255], 
      [0, 227.109375, 255, 255], 
      [0, 231.09375, 255, 255], 
      [0, 235.078125, 255, 255], 
      [0, 239.0625, 255, 255], 
      [0, 243.046875, 255, 255], 
      [0, 247.03125, 255, 255], 
      [0, 251.015625, 255, 255], 
      [0, 255, 255, 255], 
      [3.984375, 255, 251.015625, 255], 
      [7.96875, 255, 247.03125, 255], 
      [11.953125, 255, 243.046875, 255], 
      [15.9375, 255, 239.0625, 255], 
      [19.921875, 255, 235.078125, 255], 
      [23.90625, 255, 231.09375, 255], 
      [27.890625, 255, 227.109375, 255], 
      [31.875, 255, 223.125, 255], 
      [35.859375, 255, 219.140625, 255], 
      [39.84375, 255, 215.15625, 255], 
      [43.828125, 255, 211.171875, 255], 
      [47.8125, 255, 207.1875, 255], 
      [51.796875, 255, 203.203125, 255], 
      [55.78125, 255, 199.21875, 255], 
      [59.765625, 255, 195.234375, 255], 
      [63.75, 255, 191.25, 255], 
      [67.734375, 255, 187.265625, 255], 
      [71.71875, 255, 183.28125, 255], 
      [75.703125, 255, 179.296875, 255], 
      [79.6875, 255, 175.3125, 255], 
      [83.671875, 255, 171.328125, 255], 
      [87.65625, 255, 167.34375, 255], 
      [91.640625, 255, 163.359375, 255], 
      [95.625, 255, 159.375, 255], 
      [99.609375, 255, 155.390625, 255], 
      [103.59375, 255, 151.40625, 255], 
      [107.578125, 255, 147.421875, 255], 
      [111.5625, 255, 143.4375, 255], 
      [115.546875, 255, 139.453125, 255], 
      [119.53125, 255, 135.46875, 255], 
      [123.515625, 255, 131.484375, 255], 
      [127.5, 255, 127.5, 255], 
      [131.484375, 255, 123.515625, 255], 
      [135.46875, 255, 119.53125, 255], 
      [139.453125, 255, 115.546875, 255], 
      [143.4375, 255, 111.5625, 255], 
      [147.421875, 255, 107.578125, 255], 
      [151.40625, 255, 103.59375, 255], 
      [155.390625, 255, 99.609375, 255], 
      [159.375, 255, 95.625, 255], 
      [163.359375, 255, 91.640625, 255], 
      [167.34375, 255, 87.65625, 255], 
      [171.328125, 255, 83.671875, 255], 
      [175.3125, 255, 79.6875, 255], 
      [179.296875, 255, 75.703125, 255], 
      [183.28125, 255, 71.71875, 255], 
      [187.265625, 255, 67.734375, 255], 
      [191.25, 255, 63.75, 255], 
      [195.234375, 255, 59.765625, 255], 
      [199.21875, 255, 55.78125, 255], 
      [203.203125, 255, 51.796875, 255], 
      [207.1875, 255, 47.8125, 255], 
      [211.171875, 255, 43.828125, 255], 
      [215.15625, 255, 39.84375, 255], 
      [219.140625, 255, 35.859375, 255], 
      [223.125, 255, 31.875, 255], 
      [227.109375, 255, 27.890625, 255], 
      [231.09375, 255, 23.90625, 255], 
      [235.078125, 255, 19.921875, 255], 
      [239.0625, 255, 15.9375, 255], 
      [243.046875, 255, 11.953125, 255], 
      [247.03125, 255, 7.96875, 255], 
      [251.015625, 255, 3.984375, 255], 
      [255, 255, 0, 255], 
      [255, 251.015625, 0, 255], 
      [255, 247.03125, 0, 255], 
      [255, 243.046875, 0, 255], 
      [255, 239.0625, 0, 255], 
      [255, 235.078125, 0, 255], 
      [255, 231.09375, 0, 255], 
      [255, 227.109375, 0, 255], 
      [255, 223.125, 0, 255], 
      [255, 219.140625, 0, 255], 
      [255, 215.15625, 0, 255], 
      [255, 211.171875, 0, 255], 
      [255, 207.1875, 0, 255], 
      [255, 203.203125, 0, 255], 
      [255, 199.21875, 0, 255], 
      [255, 195.234375, 0, 255], 
      [255, 191.25, 0, 255], 
      [255, 187.265625, 0, 255], 
      [255, 183.28125, 0, 255], 
      [255, 179.296875, 0, 255], 
      [255, 175.3125, 0, 255], 
      [255, 171.328125, 0, 255], 
      [255, 167.34375, 0, 255], 
      [255, 163.359375, 0, 255], 
      [255, 159.375, 0, 255], 
      [255, 155.390625, 0, 255], 
      [255, 151.40625, 0, 255], 
      [255, 147.421875, 0, 255], 
      [255, 143.4375, 0, 255], 
      [255, 139.453125, 0, 255], 
      [255, 135.46875, 0, 255], 
      [255, 131.484375, 0, 255], 
      [255, 127.5, 0, 255], 
      [255, 123.515625, 0, 255], 
      [255, 119.53125, 0, 255], 
      [255, 115.546875, 0, 255], 
      [255, 111.5625, 0, 255], 
      [255, 107.578125, 0, 255], 
      [255, 103.59375, 0, 255], 
      [255, 99.609375, 0, 255], 
      [255, 95.625, 0, 255], 
      [255, 91.640625, 0, 255], 
      [255, 87.65625, 0, 255], 
      [255, 83.671875, 0, 255], 
      [255, 79.6875, 0, 255], 
      [255, 75.703125, 0, 255], 
      [255, 71.71875, 0, 255], 
      [255, 67.734375, 0, 255], 
      [255, 63.75, 0, 255], 
      [255, 59.765625, 0, 255], 
      [255, 55.78125, 0, 255], 
      [255, 51.796875, 0, 255], 
      [255, 47.8125, 0, 255], 
      [255, 43.828125, 0, 255], 
      [255, 39.84375, 0, 255], 
      [255, 35.859375, 0, 255], 
      [255, 31.875, 0, 255], 
      [255, 27.890625, 0, 255], 
      [255, 23.90625, 0, 255], 
      [255, 19.921875, 0, 255], 
      [255, 15.9375, 0, 255], 
      [255, 11.953125, 0, 255], 
      [255, 7.96875, 0, 255], 
      [255, 3.984375, 0, 255], 
      [255, 0, 0, 255], 
      [251.015625, 0, 0, 255], 
      [247.03125, 0, 0, 255], 
      [243.046875, 0, 0, 255], 
      [239.0625, 0, 0, 255], 
      [235.078125, 0, 0, 255], 
      [231.09375, 0, 0, 255], 
      [227.109375, 0, 0, 255], 
      [223.125, 0, 0, 255], 
      [219.140625, 0, 0, 255], 
      [215.15625, 0, 0, 255], 
      [211.171875, 0, 0, 255], 
      [207.1875, 0, 0, 255], 
      [203.203125, 0, 0, 255], 
      [199.21875, 0, 0, 255], 
      [195.234375, 0, 0, 255], 
      [191.25, 0, 0, 255], 
      [187.265625, 0, 0, 255], 
      [183.28125, 0, 0, 255], 
      [179.296875, 0, 0, 255], 
      [175.3125, 0, 0, 255], 
      [171.328125, 0, 0, 255], 
      [167.34375, 0, 0, 255], 
      [163.359375, 0, 0, 255], 
      [159.375, 0, 0, 255], 
      [155.390625, 0, 0, 255], 
      [151.40625, 0, 0, 255], 
      [147.421875, 0, 0, 255], 
      [143.4375, 0, 0, 255], 
      [139.453125, 0, 0, 255], 
      [135.46875, 0, 0, 255], 
      [131.484375, 0, 0, 255], 
      [127.5, 0, 0, 255], 
      [123.515625, 0, 0, 255], 
      [119.53125, 0, 0, 255], 
      [115.546875, 0, 0, 255]
      ];

  this._colArrayIDS = [[0, 0, 0, 0], 
      [100, 100, 130, 255], 
      [200, 200, 235, 255], 
      [250, 250, 210, 255], 
      [244, 214, 49, 255], 
      [0, 151, 206, 255], 
      [216, 101, 79, 255], 
      [183, 156, 220, 255], 
      [183, 214, 211, 255], 
      [152, 189, 207, 255], 
      [111, 184, 210, 255], 
      [178, 212, 242, 255], 
      [192, 104, 88, 255], 
      [177, 122, 101, 255], 
      [241, 214, 145, 255], 
      [68, 172, 100, 255], 
      [111, 197, 131, 255], 
      [216, 101, 79, 255], 
      [85, 188, 255, 255], 
      [0, 145, 30, 255], 
      [214, 230, 130, 255], 
      [78, 63, 0, 255], 
      [218, 255, 255, 255], 
      [170, 250, 250, 255], 
      [144, 238, 144, 255], 
      [140, 224, 228, 255], 
      [188, 65, 28, 255], 
      [216, 191, 216, 255], 
      [145, 60, 66, 255], 
      [150, 98, 83, 255], 
      [177, 122, 101, 255], 
      [244, 214, 49, 255], 
      [250, 250, 225, 255], 
      [200, 200, 215, 255], 
      [68, 131, 98, 255], 
      [128, 174, 128, 255], 
      [83, 146, 164, 255], 
      [83, 146, 164, 255], 
      [162, 115, 105, 255], 
      [162, 115, 105, 255], 
      [141, 93, 137, 255], 
      [141, 93, 137, 255], 
      [182, 166, 110, 255], 
      [182, 166, 110, 255], 
      [188, 135, 166, 255], 
      [188, 135, 166, 255], 
      [154, 150, 201, 255], 
      [154, 150, 201, 255], 
      [177, 140, 190, 255], 
      [177, 140, 190, 255], 
      [30, 111, 85, 255], 
      [30, 111, 85, 255], 
      [210, 157, 166, 255], 
      [210, 157, 166, 255], 
      [48, 129, 126, 255], 
      [48, 129, 126, 255], 
      [98, 153, 112, 255], 
      [98, 153, 112, 255], 
      [69, 110, 53, 255], 
      [166, 113, 137, 255], 
      [122, 101, 38, 255], 
      [122, 101, 38, 255], 
      [253, 135, 192, 255], 
      [145, 92, 109, 255], 
      [46, 101, 131, 255], 
      [0, 108, 112, 255], 
      [0, 108, 112, 255], 
      [250, 250, 225, 255], 
      [127, 150, 88, 255], 
      [127, 150, 88, 255], 
      [159, 116, 163, 255], 
      [159, 116, 163, 255], 
      [125, 102, 154, 255], 
      [125, 102, 154, 255], 
      [106, 174, 155, 255], 
      [106, 174, 155, 255], 
      [154, 146, 83, 255], 
      [154, 146, 83, 255], 
      [126, 126, 55, 255], 
      [201, 160, 133, 255], 
      [201, 160, 133, 255], 
      [78, 152, 141, 255], 
      [78, 152, 141, 255], 
      [174, 140, 103, 255], 
      [174, 140, 103, 255], 
      [139, 126, 177, 255], 
      [139, 126, 177, 255], 
      [148, 120, 72, 255], 
      [148, 120, 72, 255], 
      [186, 135, 135, 255], 
      [186, 135, 135, 255], 
      [99, 106, 24, 255], 
      [156, 171, 108, 255], 
      [156, 171, 108, 255], 
      [64, 123, 147, 255], 
      [64, 123, 147, 255], 
      [138, 95, 74, 255], 
      [97, 113, 158, 255], 
      [126, 161, 197, 255], 
      [194, 195, 164, 255], 
      [85, 188, 255, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [88, 106, 215, 255], 
      [244, 214, 49, 255], 
      [200, 200, 215, 255], 
      [250, 250, 225, 255], 
      [82, 174, 128, 255], 
      [57, 157, 110, 255], 
      [60, 143, 83, 255], 
      [92, 162, 109, 255], 
      [255, 244, 209, 255], 
      [255, 244, 209, 255], 
      [255, 244, 209, 255], 
      [255, 244, 209, 255], 
      [201, 121, 77, 255], 
      [70, 163, 117, 255], 
      [188, 91, 95, 255], 
      [177, 122, 101, 255], 
      [166, 84, 94, 255], 
      [182, 105, 107, 255], 
      [229, 147, 118, 255], 
      [229, 147, 118, 255], 
      [174, 122, 90, 255], 
      [174, 122, 90, 255], 
      [201, 112, 73, 255], 
      [201, 112, 73, 255], 
      [194, 142, 0, 255], 
      [194, 142, 0, 255], 
      [241, 213, 144, 255], 
      [203, 179, 77, 255], 
      [203, 179, 77, 255], 
      [229, 204, 109, 255], 
      [229, 204, 109, 255], 
      [255, 243, 152, 255], 
      [255, 243, 152, 255], 
      [209, 185, 85, 255], 
      [209, 185, 85, 255], 
      [248, 223, 131, 255], 
      [248, 223, 131, 255], 
      [255, 230, 138, 255], 
      [196, 172, 68, 255], 
      [255, 255, 167, 255], 
      [255, 250, 160, 255], 
      [255, 237, 145, 255], 
      [242, 217, 123, 255], 
      [242, 217, 123, 255], 
      [222, 198, 101, 255], 
      [255, 250, 220, 255], 
      [177, 122, 101, 255], 
      [213, 124, 109, 255], 
      [184, 105, 108, 255], 
      [150, 208, 243, 255], 
      [62, 162, 114, 255], 
      [62, 162, 114, 255], 
      [62, 162, 114, 255], 
      [242, 206, 142, 255], 
      [250, 210, 139, 255], 
      [255, 255, 207, 255], 
      [177, 122, 101, 255], 
      [182, 228, 255, 255], 
      [175, 216, 244, 255], 
      [197, 165, 145, 255], 
      [197, 165, 145, 255], 
      [172, 138, 115, 255], 
      [172, 138, 115, 255], 
      [202, 164, 140, 255], 
      [224, 186, 162, 255], 
      [224, 186, 162, 255], 
      [255, 245, 217, 255], 
      [206, 110, 84, 255], 
      [210, 115, 89, 255], 
      [203, 108, 81, 255], 
      [233, 138, 112, 255], 
      [195, 100, 73, 255], 
      [181, 85, 57, 255], 
      [152, 55, 13, 255], 
      [159, 63, 27, 255], 
      [166, 70, 38, 255], 
      [218, 123, 97, 255], 
      [225, 130, 104, 255], 
      [224, 97, 76, 255], 
      [255, 244, 209, 255], 
      [184, 122, 154, 255], 
      [211, 171, 143, 255], 
      [47, 150, 103, 255], 
      [255, 244, 209, 255], 
      [173, 121, 88, 255], 
      [188, 95, 76, 255], 
      [255, 239, 172, 255], 
      [226, 202, 134, 255], 
      [253, 232, 158, 255], 
      [244, 217, 154, 255], 
      [205, 179, 108, 255], 
      [205, 179, 108, 255], 
      [186, 124, 161, 255], 
      [177, 122, 101, 255], 
      [255, 255, 220, 255], 
      [234, 234, 194, 255], 
      [204, 142, 178, 255], 
      [180, 119, 153, 255], 
      [216, 132, 105, 255], 
      [255, 253, 229, 255], 
      [205, 167, 142, 255], 
      [204, 168, 143, 255], 
      [255, 224, 199, 255], 
      [221, 130, 101, 255], 
      [0, 145, 30, 255], 
      [139, 150, 98, 255], 
      [249, 180, 111, 255], 
      [157, 108, 162, 255], 
      [203, 136, 116, 255], 
      [185, 102, 83, 255], 
      [185, 102, 83, 255], 
      [247, 182, 164, 255], 
      [247, 182, 164, 255], 
      [222, 154, 132, 255], 
      [124, 186, 223, 255], 
      [249, 186, 150, 255], 
      [249, 186, 150, 255], 
      [244, 170, 147, 255], 
      [255, 181, 158, 255], 
      [255, 190, 165, 255], 
      [227, 153, 130, 255], 
      [213, 141, 113, 255], 
      [213, 141, 113, 255], 
      [193, 123, 103, 255], 
      [216, 146, 127, 255], 
      [230, 158, 140, 255], 
      [245, 172, 147, 255], 
      [245, 172, 147, 255], 
      [241, 172, 151, 255], 
      [241, 172, 151, 255], 
      [177, 124, 92, 255], 
      [171, 85, 68, 255], 
      [217, 198, 131, 255], 
      [212, 188, 102, 255], 
      [185, 135, 134, 255], 
      [185, 135, 134, 255], 
      [198, 175, 125, 255], 
      [194, 98, 79, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [255, 238, 170, 255], 
      [206, 111, 93, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [177, 122, 101, 255], 
      [216, 186, 0, 255], 
      [255, 226, 77, 255], 
      [255, 243, 106, 255], 
      [255, 234, 92, 255], 
      [240, 210, 35, 255], 
      [224, 194, 0, 255], 
      [213, 99, 79, 255], 
      [217, 102, 81, 255], 
      [0, 147, 202, 255], 
      [0, 122, 171, 255], 
      [186, 77, 64, 255], 
      [111, 197, 131, 255], 
      [220, 245, 20, 255], 
      [240, 255, 30, 255], 
      [185, 232, 61, 255], 
      [0, 226, 255, 255], 
      [251, 159, 255, 255], 
      [230, 169, 29, 255], 
      [0, 194, 113, 255], 
      [104, 160, 249, 255], 
      [221, 108, 158, 255], 
      [137, 142, 0, 255], 
      [230, 70, 0, 255], 
      [0, 147, 0, 255], 
      [0, 147, 248, 255], 
      [231, 0, 206, 255], 
      [129, 78, 0, 255], 
      [0, 116, 0, 255], 
      [0, 0, 255, 255]
    ];



  this._colArrayDEFAULT = [[0, 0, 0, 0],
          [1, 1, 1, 255],
          [2, 2, 2, 255],
          [3, 3, 3, 255],
          [4, 4, 4, 255],
          [5, 5, 5, 255],
          [6, 6, 6, 255],
          [7, 7, 7, 255],
          [8, 8, 8, 255],
          [9, 9, 9, 255],
          [10, 10, 10, 255],
          [11, 11, 11, 255],
          [12, 12, 12, 255],
          [13, 13, 13, 255],
          [14, 14, 14, 255],
          [15, 15, 15, 255],
          [16, 16, 16, 255],
          [17, 17, 17, 255],
          [18, 18, 18, 255],
          [19, 19, 19, 255],
          [20, 20, 20, 255],
          [21, 21, 21, 255],
          [22, 22, 22, 255],
          [23, 23, 23, 255],
          [24, 24, 24, 255],
          [25, 25, 25, 255],
          [26, 26, 26, 255],
          [27, 27, 27, 255],
          [28, 28, 28, 255],
          [29, 29, 29, 255],
          [30, 30, 30, 255],
          [31, 31, 31, 255],
          [32, 32, 32, 255],
          [33, 33, 33, 255],
          [34, 34, 34, 255],
          [35, 35, 35, 255],
          [36, 36, 36, 255],
          [37, 37, 37, 255],
          [38, 38, 38, 255],
          [39, 39, 39, 255],
          [40, 40, 40, 255],
          [41, 41, 41, 255],
          [42, 42, 42, 255],
          [43, 43, 43, 255],
          [44, 44, 44, 255],
          [45, 45, 45, 255],
          [46, 46, 46, 255],
          [47, 47, 47, 255],
          [48, 48, 48, 255],
          [49, 49, 49, 255],
          [50, 50, 50, 255],
          [51, 51, 51, 255],
          [52, 52, 52, 255],
          [53, 53, 53, 255],
          [54, 54, 54, 255],
          [55, 55, 55, 255],
          [56, 56, 56, 255],
          [57, 57, 57, 255],
          [58, 58, 58, 255],
          [59, 59, 59, 255],
          [60, 60, 60, 255],
          [61, 61, 61, 255],
          [62, 62, 62, 255],
          [63, 63, 63, 255],
          [64, 64, 64, 255],
          [65, 65, 65, 255],
          [66, 66, 66, 255],
          [67, 67, 67, 255],
          [68, 68, 68, 255],
          [69, 69, 69, 255],
          [70, 70, 70, 255],
          [71, 71, 71, 255],
          [72, 72, 72, 255],
          [73, 73, 73, 255],
          [74, 74, 74, 255],
          [75, 75, 75, 255],
          [76, 76, 76, 255],
          [77, 77, 77, 255],
          [78, 78, 78, 255],
          [79, 79, 79, 255],
          [80, 80, 80, 255],
          [81, 81, 81, 255],
          [82, 82, 82, 255],
          [83, 83, 83, 255],
          [84, 84, 84, 255],
          [85, 85, 85, 255],
          [86, 86, 86, 255],
          [87, 87, 87, 255],
          [88, 88, 88, 255],
          [89, 89, 89, 255],
          [90, 90, 90, 255],
          [91, 91, 91, 255],
          [92, 92, 92, 255],
          [93, 93, 93, 255],
          [94, 94, 94, 255],
          [95, 95, 95, 255],
          [96, 96, 96, 255],
          [97, 97, 97, 255],
          [98, 98, 98, 255],
          [99, 99, 99, 255],
          [100, 100, 100, 255],
          [101, 101, 101, 255],
          [102, 102, 102, 255],
          [103, 103, 103, 255],
          [104, 104, 104, 255],
          [105, 105, 105, 255],
          [106, 106, 106, 255],
          [107, 107, 107, 255],
          [108, 108, 108, 255],
          [109, 109, 109, 255],
          [110, 110, 110, 255],
          [111, 111, 111, 255],
          [112, 112, 112, 255],
          [113, 113, 113, 255],
          [114, 114, 114, 255],
          [115, 115, 115, 255],
          [116, 116, 116, 255],
          [117, 117, 117, 255],
          [118, 118, 118, 255],
          [119, 119, 119, 255],
          [120, 120, 120, 255],
          [121, 121, 121, 255],
          [122, 122, 122, 255],
          [123, 123, 123, 255],
          [124, 124, 124, 255],
          [125, 125, 125, 255],
          [126, 126, 126, 255],
          [127, 127, 127, 255],
          [128, 128, 128, 255],
          [129, 129, 129, 255],
          [130, 130, 130, 255],
          [131, 131, 131, 255],
          [132, 132, 132, 255],
          [133, 133, 133, 255],
          [134, 134, 134, 255],
          [135, 135, 135, 255],
          [136, 136, 136, 255],
          [137, 137, 137, 255],
          [138, 138, 138, 255],
          [139, 139, 139, 255],
          [140, 140, 140, 255],
          [141, 141, 141, 255],
          [142, 142, 142, 255],
          [143, 143, 143, 255],
          [144, 144, 144, 255],
          [145, 145, 145, 255],
          [146, 146, 146, 255],
          [147, 147, 147, 255],
          [148, 148, 148, 255],
          [149, 149, 149, 255],
          [150, 150, 150, 255],
          [151, 151, 151, 255],
          [152, 152, 152, 255],
          [153, 153, 153, 255],
          [154, 154, 154, 255],
          [155, 155, 155, 255],
          [156, 156, 156, 255],
          [157, 157, 157, 255],
          [158, 158, 158, 255],
          [159, 159, 159, 255],
          [160, 160, 160, 255],
          [161, 161, 161, 255],
          [162, 162, 162, 255],
          [163, 163, 163, 255],
          [164, 164, 164, 255],
          [165, 165, 165, 255],
          [166, 166, 166, 255],
          [167, 167, 167, 255],
          [168, 168, 168, 255],
          [169, 169, 169, 255],
          [170, 170, 170, 255],
          [171, 171, 171, 255],
          [172, 172, 172, 255],
          [173, 173, 173, 255],
          [174, 174, 174, 255],
          [175, 175, 175, 255],
          [176, 176, 176, 255],
          [177, 177, 177, 255],
          [178, 178, 178, 255],
          [179, 179, 179, 255],
          [180, 180, 180, 255],
          [181, 181, 181, 255],
          [182, 182, 182, 255],
          [183, 183, 183, 255],
          [184, 184, 184, 255],
          [185, 185, 185, 255],
          [186, 186, 186, 255],
          [187, 187, 187, 255],
          [188, 188, 188, 255],
          [189, 189, 189, 255],
          [190, 190, 190, 255],
          [191, 191, 191, 255],
          [192, 192, 192, 255],
          [193, 193, 193, 255],
          [194, 194, 194, 255],
          [195, 195, 195, 255],
          [196, 196, 196, 255],
          [197, 197, 197, 255],
          [198, 198, 198, 255],
          [199, 199, 199, 255],
          [200, 200, 200, 255],
          [201, 201, 201, 255],
          [202, 202, 202, 255],
          [203, 203, 203, 255],
          [204, 204, 204, 255],
          [205, 205, 205, 255],
          [206, 206, 206, 255],
          [207, 207, 207, 255],
          [208, 208, 208, 255],
          [209, 209, 209, 255],
          [210, 210, 210, 255],
          [211, 211, 211, 255],
          [212, 212, 212, 255],
          [213, 213, 213, 255],
          [214, 214, 214, 255],
          [215, 215, 215, 255],
          [216, 216, 216, 255],
          [217, 217, 217, 255],
          [218, 218, 218, 255],
          [219, 219, 219, 255],
          [220, 220, 220, 255],
          [221, 221, 221, 255],
          [222, 222, 222, 255],
          [223, 223, 223, 255],
          [224, 224, 224, 255],
          [225, 225, 225, 255],
          [226, 226, 226, 255],
          [227, 227, 227, 255],
          [228, 228, 228, 255],
          [229, 229, 229, 255],
          [230, 230, 230, 255],
          [231, 231, 231, 255],
          [232, 232, 232, 255],
          [233, 233, 233, 255],
          [234, 234, 234, 255],
          [235, 235, 235, 255],
          [236, 236, 236, 255],
          [237, 237, 237, 255],
          [238, 238, 238, 255],
          [239, 239, 239, 255],
          [240, 240, 240, 255],
          [241, 241, 241, 255],
          [242, 242, 242, 255],
          [243, 243, 243, 255],
          [244, 244, 244, 255],
          [245, 245, 245, 255],
          [246, 246, 246, 255],
          [247, 247, 247, 255],
          [248, 248, 248, 255],
          [249, 249, 249, 255],
          [250, 250, 250, 255],
          [251, 251, 251, 255],
          [252, 252, 252, 255],
          [253, 253, 253, 255],
          [254, 254, 254, 255],
          [255, 255, 255, 255]
        ];


  //this._colArrayCURRENT = this._colArrayDEFAULT;
  //LL: change so default is heat-map:
  this._colArrayCURRENT = this._colArrayHEAT;
  //this._labelArrayCURRENT = this._colArrayIDS;
  this._labelArrayCURRENT = this._colArrayDEFAULT;

  this._colArrayChanged = false;
  // ---------------------

  /**
   * The animation frame ID.
   *
   * @type {!number}
   * @protected
   */
  this._AnimationFrameID = -1;

  window.console
      .log('XTK release 10 -- ###TIMESTAMP### -- http://www.goXTK.com -- @goXTK');

};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * The callback for X.event.events.COMPUTING events which indicate computing
 * for volume rendering
 *
 * @param {!X.event.ComputingEvent} event The computing event.
 * @public
 */
X.renderer.prototype.onComputing = function(event) {

  // stop the rendering loop
  window.cancelAnimationFrame(this._AnimationFrameID);

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

      this._progressBar2 = new X.progressbar(this._container, 3);

  }

};


/**
 * The callback for X.event.events.COMPUTING_END events which indicate the end of computing
 * for volume rendering
 *
 * @param {!X.event.ComputingEndEvent} event The computing end event.
 * @public
 */
X.renderer.prototype.onComputingEnd = function(event) {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    if (this._progressBar2) {

      // show a green, full progress bar
      this._progressBar2.done();

      // wait for a short time
      this.__readyCheckTimer2 = goog.Timer.callOnce(function() {

        this.__readyCheckTimer2 = null;

        if (this._progressBar2) {

          // we are done, kill the progressbar
          this._progressBar2.kill();
          this._progressBar2 = null;

        }

      // // we don't want to call onShowtime again
      this._onShowtime = true;
      this._loadingCompleted = true;

      // restart the rendering loop
      this.render();

      }.bind(this), 700);
      // .. and jump out
      return;

    } // if progressBar still exists

  } // if progressBar is enabled

};


/**
 * The callback for X.event.events.COMPUTING_PROGRESS events which indicate progress
 * updates during computing.
 *
 * @param {!X.event.ComputingProgressEvent} event The progress event holding the total
 *          progress value.
 * @public
 */
X.renderer.prototype.onComputingProgress = function(event) {

  if (this._progressBar2) {

    var _progress = event._value;
    this._progressBar2.setValue(_progress * 100);

  }

};


/**
 * The callback for X.event.events.PROGRESS events which indicate progress
 * updates during loading.
 *
 * @param {!X.event.ProgressEvent} event The progress event holding the total
 *          progress value.
 * @public
 */
X.renderer.prototype.onProgress = function(event) {

  if (this._progressBar) {

    var _progress = event._value;
    this._progressBar.setValue(_progress * 100);

  }

};


/**
 * The callback for X.event.events.MODIFIED events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 *
 * @param {!X.event.ModifiedEvent} event The modified event pointing to the
 *          modified object.
 * @public
 */
X.renderer.prototype.onModified = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.ModifiedEvent) {

    if (!event._object) {
      // we need an object here
      return;

    }

    this.update_(event._object);

  }

};

/**
 * The callback for X.event.events.REMOVE events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 *
 * @param {!X.event.RemoveEvent} event The modified event pointing to the
 *          modified object.
 * @public
 */
X.renderer.prototype.onRemove = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.RemoveEvent) {

    if (!event._object) {

      // we need an object here
      return;

    }

    this.remove(event._object);

  }

};


/**
 * The callback for X.event.events.HOVER events which indicate a hovering over
 * the viewport.
 *
 * @param {!X.event.HoverEvent} event The hover event pointing to the relevant
 *          screen coordinates.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onHover_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.HoverEvent)) {

    throw new Error('Invalid hover event.');

  }

};


/**
 * @protected
 */
X.renderer.prototype.onResize_ = function() {
    this.resize();
};


/**
 * Resizes the control to fit the size of the container.
 */
X.renderer.prototype.resize = function() {

  // grab the new width and height of the container
  var container = goog.dom.getElement(this._container);
  this._width = container.clientWidth;
  this._height = container.clientHeight;

  // propagate it to the canvas
  var canvas = goog.dom.getElement(this._canvas);
  canvas.width = this._width;
  canvas.height = this._height;

  if (this._classname == 'renderer3D') {

    // modify 3d viewport
    this._context.viewport(0, 0, this._width, this._height);

    // modify perspective
    this._camera._perspective = X.matrix.makePerspective(X.matrix.identity(), this._camera._fieldOfView, (this._canvas.width/this._canvas.height), 1, 10000);

  }

  // .. and re-draw
  //this.resetViewAndRender();

};


/**
 * The callback for X.event.events.SCROLL events which indicate scrolling of the
 * viewport.
 *
 * @param {!X.event.ScrollEvent} event The scroll event indicating the scrolling
 *          direction.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onScroll_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.ScrollEvent)) {

    throw new Error('Invalid scroll event.');

  }

};


/**
 * Access the configuration of this renderer. Possible settings and there
 * default values are:
 *
 * <pre>
 * config.PROGRESSBAR_ENABLED: true
 * config.INTERMEDIATE_RENDERING: false
 * config.SLICENAVIGATORS: true
 * config.PROGRESSBAR_ENABLED: true
 * </pre>
 *
 * @return {Object} The configuration.
 */
X.renderer.prototype.__defineGetter__('config', function() {

  return this._config;

});


/**
 * Get the interactor of this renderer. The interactor is null until this
 * renderer is initialized.
 *
 * @return {?X.interactor} The interactor.
 */
X.renderer.prototype.__defineGetter__('interactor', function() {

  return this._interactor;

});


/**
 * Get the camera of this renderer. The camera is null until this renderer is
 * initialized.
 *
 * @return {?X.camera} The camera.
 */
X.renderer.prototype.__defineGetter__('camera', function() {

  return this._camera;

});


/**
 * Check if the initial loading of all objects was completed. This value gets
 * set immediately after the onShowtime function is executed.
 *
 * @return {boolean} TRUE if all objects were completely loaded, FALSE else
 *         wise.
 */
X.renderer.prototype.__defineGetter__('loadingCompleted', function() {

  return this._loadingCompleted;

});


/**
 * Get the container of this renderer.
 *
 * @return {!Element|HTMLBodyElement} The container of this renderer.
 * @public
 */
X.renderer.prototype.__defineGetter__('container', function() {

  return this._container;

});

// LL added from D.B. version:-------------------------
/**
   GETTER FOR OBJECTS
   
 */
X.renderer.prototype.__defineGetter__('objects', function() {

    return this._objects;

});



X.renderer.prototype.__defineGetter__('topLevelObjects', function() {

    return this._topLevelObjects;

});


X.renderer.prototype.__defineSetter__('topLevelObjects', function(topLevelObjects) {

    this._topLevelObjects = topLevelObjects;

});

//loader to access this during run time, add color table...
X.renderer.prototype.__defineGetter__('loader', function() {

    return this._loader;

});

/**
//-----------------------------------------

/**
 * Set the container for this renderer. This has to happen before
 * X.renderer.init() is called.
 *
 * @param {!string|Element|HTMLBodyElement} container Either an ID to a DOM
 *          container or the DOM element itself.
 * @throws {Error} An error, if the given container is invalid.
 * @public
 */
X.renderer.prototype.__defineSetter__('container', function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {

    throw new Error('An ID to a valid container (<div>..) is required.');

  }

  // check if the passed container is really valid
  var _container = container;

  // if an id is given, try to get the corresponding DOM element
  if (goog.isString(_container)) {

    _container = goog.dom.getElement(container);

  }

  // now we should have a valid DOM element
  if (!goog.dom.isElement(_container)) {

    throw new Error('Could not find the given container.');

  }

  this._container = _container;

});


/**
 * Resets the view according to the global bounding box of all associated
 * objects, the configured camera position as well as its focus _and_ triggers
 * re-rendering.
 */
X.renderer.prototype.resetViewAndRender = function() {

  this._camera.reset();
  // this.render_(false, false);

};


/**
 * Shows the loading progress bar by modifying the DOM tree.
 *
 * @protected
 */
X.renderer.prototype.showProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    // create a progress bar here if this is the first render request and the
    // loader is working
    if (!this._progressBar) {

      this._progressBar = new X.progressbar(this._container, 3);

    }

  }

};


/**
 * Hides the loading progress bar.
 *
 * @protected
 */
X.renderer.prototype.hideProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    if (this._progressBar && !this.__readyCheckTimer2) {

      // show a green, full progress bar
      this._progressBar.done();

      // wait for a short time
      this.__readyCheckTimer2 = goog.Timer.callOnce(function() {

        this.__readyCheckTimer2 = null;

        if (this._progressBar) {

          // we are done, kill the progressbar
          this._progressBar.kill();
          this._progressBar = null;

        }

        this.render();

      }.bind(this), 700);
      // .. and jump out
      return;

    } // if progressBar still exists

  } // if progressBar is enabled

};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height etc. Then, initialize the rendering context and
 * attach all necessary objects (e.g. camera, shaders..). Finally, initialize
 * the event listeners.
 *
 * @param {string} _contextName The name of the context to create.
 * @throws {Error} An exception if there were problems during initialization.
 * @protected
 */
X.renderer.prototype.init = function(_contextName) {

  // create the canvas
  var _canvas = goog.dom.createDom('canvas');

  //
  // append it to the container
  goog.dom.appendChild(this._container, _canvas);

  // the container might have resized now, so update our width and height
  // settings
  this._width = this._container.clientWidth;
  this._height = this._container.clientHeight;

  // width and height can not be set using CSS but via object properties
  _canvas.width = this._width;
  _canvas.height = this._height;


  // --------------------------------------------------------------------------
  //
  // Viewport initialization
  //

  //
  // Step1: Get Context of canvas
  //
  try {

    var _context = _canvas.getContext(_contextName);

    if (!_context) {

      // this exception triggers the display of the error message
      // because the context creation can either fail with an exception
      // or return a NULL context
      throw new Error();

    }

  } catch (e) {

    // Canvas2D is not supported with this browser/machine/gpu

    // attach a message to the container's inner HTML
    var _style = "color:red;font-family:sans-serif;";
    var _msg = 'Sorry, ' +
        _contextName +
        ' context is <strong>not supported</strong> on this machine! See <a href="http://crash.goXTK.com" target="_blank">http://crash.goXTK.com</a> for requirements..';
    this._container.innerHTML = '<h3 style="' + _style +
        '">Oooops..</h3><p style="' + _style + '">' + _msg + '</p>';

    // .. and throw an exception
    throw new Error(_msg);

  }

  //
  // Step 1b: Configure the X.loader
  //
  this._loader = new X.loader();

  // listen to a progress event which gets fired during loading whenever
  // progress was made
  goog.events.listen(this._loader, X.event.events.PROGRESS, this.onProgress
      .bind(this));

  //
  // Step 1c: Register the created canvas to this instance
  //
  this._canvas = _canvas;

  //
  // Step 1d: Register the created context to this instance
  //
  this._context = _context;

  //
  // Step2: Configure the context and the viewport
  //

  //
  // create a new interactor
  var _interactor = new X.interactor3D(this._canvas);

  // in the 2d case, create a 2d interactor (of course..)
  if (_contextName == '2d') {

    _interactor = new X.interactor2D(this._canvas);

  }
  // initialize it and..
  _interactor.init();

  // .. listen to resetViewEvents
  goog.events.listen(_interactor, X.event.events.RESETVIEW,
      this.resetViewAndRender.bind(this));
  // .. listen to hoverEvents
  goog.events.listen(_interactor, X.event.events.HOVER, this.onHover_
      .bind(this));
  // .. listen to scroll events
  goog.events.listen(_interactor, X.event.events.SCROLL, this.onScroll_
      .bind(this));

  // .. and finally register it to this instance
  this._interactor = _interactor;

  //
  // create a new camera
  // width and height are required to calculate the perspective
  var _camera = new X.camera3D(this._width, this._height);

  if (_contextName == '2d') {
    _camera = new X.camera2D(this._width, this._height);
  }
  // observe the interactor for user interactions (mouse-movements etc.)
  _camera.observe(this._interactor);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  // goog.events.listen(_camera, X.event.events.RENDER, this.render_.bind(this,
  // false, false));

  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this._camera = _camera;

  // .. listen to resizeEvents
  goog.events.listen(window, goog.events.EventType.RESIZE, this.onResize_,
      false, this);

  //
  //
  // .. the rest should be performed in the subclasses

};


/**
 * Add a new object to this renderer. The renderer has to be initialized before
 * doing so. A X.renderer.render() call has to be initiated to display added
 * objects.
 *
 * @param {!X.object} object The object to add to this renderer.
 * @throws {Error} An exception if something goes wrong.
 */
X.renderer.prototype.add = function(object) {

  // for constructable objects (e.g. cube, sphere, cylinder), we call the
  // modified() function to generate the CSG representations
  if (object instanceof X.cube || object instanceof X.sphere ||
      object instanceof X.cylinder) {

    object.modified();

  }

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this._topLevelObjects.push(object);

  this.update_(object);

};


/**
 * Remove an existing object and all its children from the rendering context.
 *
 * @param {!X.object} object The object to remove from the renderer.
 * @return {boolean} TRUE or FALSE depending on success.
 * @throws {Error} An exception if something goes wrong.
 * @public
 */
X.renderer.prototype.remove = function(object) {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  if (!goog.isDefAndNotNull(object)) {

    //throw new Error('Illegal object.');

  }
  else{

    goog.events.removeAll(object);

    var _numberOfTopLevelObjects = this._topLevelObjects.length;

    var _y;
    for (_y = 0; _y < _numberOfTopLevelObjects; _y++) {

      if(this._topLevelObjects[_y]._id == object._id){
        this._topLevelObjects[_y] = null;
        this._topLevelObjects.splice(_y, 1);
        return true;
      }
    }
  }

	// to be overloaded

  return false;

};


/**
 * Configure a displayable object within this renderer. The object can be a
 * newly created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 *
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {Error} An exception if something goes wrong.
 * @protected
 */
X.renderer.prototype.update_ = function(object) {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  if (!goog.isDefAndNotNull(object)) {
    //window.console.log(object);
    //window.console.log('Illegal object');
    //throw new Error('Illegal object.');

  }
  else {

    if(!goog.events.hasListener(object, X.event.events.MODIFIED)) {

      goog.events.listen(object, X.event.events.MODIFIED, this.onModified
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.REMOVE)) {

      goog.events.listen(object, X.event.events.REMOVE, this.onRemove
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING)) {

      goog.events.listen(object, X.event.events.COMPUTING, this.onComputing
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING_PROGRESS)) {

      goog.events.listen(object, X.event.events.COMPUTING_PROGRESS, this.onComputingProgress
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING_END)) {

      goog.events.listen(object, X.event.events.COMPUTING_END, this.onComputingEnd
          .bind(this));

    }

  }

};


/**
 * Get the existing X.object with the given id.
 *
 * @param {!number} id The object's id.
 * @return {?X.object} The requested X.object or null if it was not found.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.renderer.prototype.get = function(id) {

  if (!goog.isDefAndNotNull(id)) {

    throw new Error('Invalid object id.');

  }

  // loop through objects and try to find the id
  var _objects = this._objects.values();
  var _numberOfObjects = _objects.length;

  var _k = 0;
  for (_k = 0; _k < _numberOfObjects; _k++) {

    if (_objects[_k]._id == id) {

      // found!
      return _objects[_k];

    }

  }

  // not found
  return null;

};


/**
 * Print the full hierarchy tree of objects.
 *
 * @public
 */
X.renderer.prototype.printScene = function() {

  var _numberOfTopLevelObjects = this._topLevelObjects.length;
  // window.console.log(_numberOfTopLevelObjects);
  // window.console.log(this._objects);

  var _y;
  for (_y = 0; _y < _numberOfTopLevelObjects; _y++) {

    var _topLevelObject = this._topLevelObjects[_y];

    this.generateTree_(_topLevelObject, 0);

  }

};


/**
 * Recursively loop through a hierarchy tree of objects and print it.
 *
 * @param {!X.object} object The starting point object.
 * @param {number} level The current level in the scene hierarchy.
 * @protected
 */
X.renderer.prototype.generateTree_ = function(object, level) {

  // for slices, container is right size but empty
  if(typeof(object) == 'undefined'){
    return;
  }

  var _output = "";

  var _l = 0;
  for (_l = 0; _l < level; _l++) {

    _output += ">";

  }

  _output += object._id;

  // window.console.log(object);
  // window.console.log(_output);

  if (object._children.length > 0) {

    // loop through the children
    var _children = object._children;
    var _numberOfChildren = _children.length;
    var _c = 0;

    for (_c = 0; _c < _numberOfChildren; _c++) {

      this.generateTree_(_children[_c], level + 1);

    }

  }

};


/**
 * (Re-)render all associated displayable objects of this renderer. This method
 * clears the viewport and re-draws everything by looping through the tree of
 * objects. The current camera is used to setup the world space.
 *
 * @public
 */
X.renderer.prototype.render = function() {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  // READY CHECK
  //
  // now we check if we are ready to display everything
  // - ready means: all textures loaded and setup, all external files loaded and
  // setup and all other objects loaded and setup
  //
  // if we are not ready, we wait..
  // if we are ready, we continue with the rendering

  // let's check if render() was called before and the single-shot timer is
  // already there
  // f.e., if we are in a setInterval-configured render loop, we do not want to
  // create multiple single-shot timers
  if (goog.isDefAndNotNull(this._readyCheckTimer)) {

    return;

  }

  //
  // LOADING..
  //
  if (!this._loader.completed()) {

    // we are not ready yet.. the loader is still working;

    this.showProgressBar_();

    // also reset the loadingCompleted flags
    this._loadingCompleted = false;
    this._onShowtime = false;

    // let's check again in a short time
    this._readyCheckTimer = goog.Timer.callOnce(function() {

      this._readyCheckTimer = null; // destroy the timer

      // try to render now..
      // if the loader is ready it will work, else wise another single-shot gets
      // configured in 500 ms
      this.render();

    }.bind(this), 100); // check again in 500 ms

    // intermediate rendering means render also
    // while loading is still active
    if (!this._config['INTERMEDIATE_RENDERING']) {

      return; // .. and jump out

    }

  } else {

    // we are ready! yahoooo!

    // call the onShowtime function which can be overloaded

    // we need two flags here since the render loop repeats so fast
    // that there would be timing issues
    if (!this._loadingCompleted && !this._onShowtime) {

      this._onShowtime = true;
      eval("this.onShowtime()");
      this._loadingCompleted = true; // flag the renderer as 'initial
      // loading completed'

    }

    // if we have a progress bar
    if (this._progressBar) {

      // this means the X.loader is done..
      this.hideProgressBar_();

      // .. we exit here since the hiding takes some time and automatically
      // triggers the rendering when done
      return;

    }

  }
  //
  // END OF LOADING
  //

  //
  // CURTAIN UP! LET THE SHOW BEGIN..
  //

  // this starts the rendering loops and store its id
  this._AnimationFrameID = window.requestAnimationFrame(this.render.bind(this));
  eval("this.onRender()");
  this.render_(false, true);
  eval("this.afterRender()");

};


/**
 * Overload this function to execute code after all initial loading (files,
 * textures..) has completed and just before the first real rendering call.
 *
 * @public
 */
X.renderer.prototype.onShowtime = function() {

  // do nothing
};


/**
 * Overload this function to execute code on each rendering call.
 *
 * @public
 */
X.renderer.prototype.onRender = function() {

  // do nothing
};


/**
 * Overload this function to execute code after each rendering completed.
 *
 * @public
 */
X.renderer.prototype.afterRender = function() {

    // do nothing
};

/**
 * Internal function to perform the actual rendering by looping through all
 * associated X.objects.
 *
 * @param {boolean} picking If TRUE, perform picking - if FALSE render to the
 *          canvas viewport.
 * @param {?boolean=} invoked If TRUE, the render counts as invoked and f.e.
 *          statistics are generated.
 * @throws {Error} If anything goes wrong.
 * @protected
 */
X.renderer.prototype.render_ = function(picking, invoked) {



};


/**
 * Destroy this renderer.
 *
 * @public
 */
X.renderer.prototype.destroy = function() {

  // disconnect events listeners
  goog.events.removeAll(this);
  goog.events.unlisten(window, goog.events.EventType.RESIZE, this.onResize_,
      false, this);

  // stop the rendering loop
  window.cancelAnimationFrame(this._AnimationFrameID);

  // delete the loader if any
  if (this._loader) {
    delete this._loader;
    this._loader = null;
  }

  // remove the progress bar if any
  if (this._progressBar) {
    this._progressBar.kill();
    delete this._progressBar;
    this._progressBar = null;
  }

  // remove all objects
  this._objects.clear();
  delete this._objects;
  this._topLevelObjects.length = 0;
  delete this._topLevelObjects;

  // remove loader, camera and interactor
  delete this._loader;
  this._loader = null;

  delete this._camera;
  this._camera = null;

  delete this._interactor;
  this._interactor = null;

  // remove the rendering context
  delete this._context;
  this._context = null;

  // remove the canvas from the dom tree
  goog.dom.removeNode(this._canvas);
  delete this._canvas;
  this._canvas = null;

};
