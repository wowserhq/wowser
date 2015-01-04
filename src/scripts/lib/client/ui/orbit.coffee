# /**
#  * @author qiao / https:#github.com/qiao
#  * @author mrdoob / http:#mrdoob.com
#  * @author alteredq / http:#alteredqualia.com/
#  * @author WestLangley / http:#github.com/WestLangley
#  * @author erich666 / http:#erichaines.com
#  */
# /*global THREE, console */

# This set of controls performs orbiting, dollying (zooming), and panning. It maintains
# the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
# supported.
#
#    Orbit - left mouse / touch: one finger move
#    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
#    Pan - right mouse, or arrow keys / touch: three finter swipe
#
# This is a drop-in replacement for (most) TrackballControls used in examples.
# That is, include this js file and wherever you see:
#      controls = new THREE.TrackballControls( camera )
#      controls.target.z = 150
# Simple substitute "OrbitControls" and the control should work as-is.

THREE = require('three')

module.exports = THREE.OrbitControls = ( object, domElement ) ->

  @object = object
  @domElement = if domElement? then domElement else document

  # API

  # Set to false to disable this control
  @enabled = true

  # "target" sets the location of focus, where the control orbits around
  # and where it pans with respect to.
  @target = new THREE.Vector3()

  # center is old, deprecated use "target" instead
  @center = @target

  # This option actually enables dollying in and out left as "zoom" for
  # backwards compatibility
  @noZoom = false
  @zoomSpeed = 1.0

  # Limits to how far you can dolly in and out
  @minDistance = 0
  @maxDistance = Infinity

  # Set to true to disable this control
  @noRotate = false
  @rotateSpeed = 1.0

  # Set to true to disable this control
  @noPan = false
  @keyPanSpeed = 7.0 # pixels moved per arrow key push

  # Set to true to automatically rotate around the target
  @autoRotate = false
  @autoRotateSpeed = 2.0 # 30 seconds per round when fps is 60

  # How far you can orbit vertically, upper and lower limits.
  # Range is 0 to Math.PI radians.
  @minPolarAngle = 0 # radians
  @maxPolarAngle = Math.PI # radians

  # Set to true to disable use of the keys
  @noKeys = false

  # The four arrow keys
  @keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }

  ######
  # internals

  scope = this

  EPS = 0.000001

  rotateStart = new THREE.Vector2()
  rotateEnd = new THREE.Vector2()
  rotateDelta = new THREE.Vector2()

  panStart = new THREE.Vector2()
  panEnd = new THREE.Vector2()
  panDelta = new THREE.Vector2()
  panOffset = new THREE.Vector3()

  offset = new THREE.Vector3()

  dollyStart = new THREE.Vector2()
  dollyEnd = new THREE.Vector2()
  dollyDelta = new THREE.Vector2()

  phiDelta = 0
  thetaDelta = 0
  scale = 1
  pan = new THREE.Vector3()

  lastPosition = new THREE.Vector3()

  STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 }

  state = STATE.NONE

  # for reset

  @target0 = @target.clone()
  @position0 = @object.position.clone()

  # so camera.up is the orbit axis

  quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) )
  quatInverse = quat.clone().inverse()

  # events

  changeEvent = { type: 'change' }
  startEvent = { type: 'start'}
  endEvent = { type: 'end'}


  @rotateLeft = ( angle ) ->
    angle = getAutoRotationAngle() unless angle?
    thetaDelta -= angle


  @rotateUp = ( angle ) ->
    angle = getAutoRotationAngle() unless angle?
    phiDelta -= angle


  # pass in distance in world space to move left
  @panLeft = ( distance ) ->
    te = @object.matrix.elements

    # get X column of matrix
    panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] )
    panOffset.multiplyScalar( - distance )

    pan.add( panOffset )


  # pass in distance in world space to move up
  @panUp = ( distance ) ->
    te = @object.matrix.elements

    # get Y column of matrix
    panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] )
    panOffset.multiplyScalar( distance )

    pan.add( panOffset )


  # pass in x,y of change desired in pixel space,
  # right and down are positive
  @pan = ( deltaX, deltaY ) ->
    element = if scope.domElement == document then scope.domElement.body else scope.domElement

    if scope.object.fov?

      # perspective
      position = scope.object.position
      offset = position.clone().sub( scope.target )
      targetDistance = offset.length()

      # half of the fov is center to top of screen
      targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 )

      # we actually don't use screenWidth, since perspective camera is fixed to screen height
      scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight )
      scope.panUp( 2 * deltaY * targetDistance / element.clientHeight )

    else if scope.object.top?

      # orthographic
      scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth )
      scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight )

    else

      # camera neither orthographic or perspective
      console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' )


  @dollyIn = ( dollyScale ) ->
    dollyScale = getZoomScale() unless dollyScale?
    scale /= dollyScale


  @dollyOut = ( dollyScale ) ->
    dollyScale = getZoomScale() unless dollyScale?
    scale *= dollyScale


  @update = ->

    position = @object.position

    offset.copy( position ).sub( @target )

    # rotate offset to "y-axis-is-up" space
    offset.applyQuaternion( quat )

    # angle from z-axis around y-axis

    theta = Math.atan2( offset.x, offset.z )

    # angle from y-axis

    phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y )

    @rotateLeft( getAutoRotationAngle() ) if ( @autoRotate )

    theta += thetaDelta
    phi += phiDelta

    # restrict phi to be between desired limits
    phi = Math.max( @minPolarAngle, Math.min( @maxPolarAngle, phi ) )

    # restrict phi to be betwee EPS and PI-EPS
    phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) )

    radius = offset.length() * scale

    # restrict radius to be between desired limits
    radius = Math.max( @minDistance, Math.min( @maxDistance, radius ) )

    # move target to panned location
    @target.add( pan )

    offset.x = radius * Math.sin( phi ) * Math.sin( theta )
    offset.y = radius * Math.cos( phi )
    offset.z = radius * Math.sin( phi ) * Math.cos( theta )

    # rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion( quatInverse )

    position.copy( @target ).add( offset )

    @object.lookAt( @target )

    thetaDelta = 0
    phiDelta = 0
    scale = 1
    pan.set( 0, 0, 0 )

    if ( lastPosition.distanceToSquared( @object.position ) > EPS )

      @dispatchEvent( changeEvent )

      lastPosition.copy( @object.position )


  @reset = ->

    state = STATE.NONE

    @target.copy( @target0 )
    @object.position.copy( @position0 )

    @update()


  getAutoRotationAngle = ->
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed


  getZoomScale = ->
    return Math.pow( 0.95, scope.zoomSpeed )


  onMouseDown = ( event ) ->

    if ( scope.enabled == false ) then return
    event.preventDefault()

    if ( event.button == 0 )
      if ( scope.noRotate == true ) then return

      state = STATE.ROTATE

      rotateStart.set( event.clientX, event.clientY )

    else if ( event.button == 1 )
      if ( scope.noZoom == true ) then return

      state = STATE.DOLLY

      dollyStart.set( event.clientX, event.clientY )

    else if ( event.button == 2 )
      if ( scope.noPan == true ) then return

      state = STATE.PAN

      panStart.set( event.clientX, event.clientY )

    scope.domElement.addEventListener( 'mousemove', onMouseMove, false )
    scope.domElement.addEventListener( 'mouseup', onMouseUp, false )
    scope.dispatchEvent( startEvent )


  onMouseMove = ( event ) ->

    if ( scope.enabled == false ) then return

    event.preventDefault()

    element = if scope.domElement == document then scope.domElement.body else scope.domElement

    if ( state == STATE.ROTATE )

      if ( scope.noRotate == true ) then return

      rotateEnd.set( event.clientX, event.clientY )
      rotateDelta.subVectors( rotateEnd, rotateStart )

      # rotating across whole screen goes 360 degrees around
      scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed )

      # rotating up and down along whole screen attempts to go 360, but limited to 180
      scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed )

      rotateStart.copy( rotateEnd )

    else if ( state == STATE.DOLLY )

      if ( scope.noZoom == true ) then return

      dollyEnd.set( event.clientX, event.clientY )
      dollyDelta.subVectors( dollyEnd, dollyStart )

      if ( dollyDelta.y > 0 )
        scope.dollyIn()
      else
        scope.dollyOut()

      dollyStart.copy( dollyEnd )

    else if ( state == STATE.PAN )

      if ( scope.noPan == true ) then return

      panEnd.set( event.clientX, event.clientY )
      panDelta.subVectors( panEnd, panStart )

      scope.pan( panDelta.x, panDelta.y )

      panStart.copy( panEnd )

    scope.update()


  onMouseUp = ->

    if ( scope.enabled == false ) then return

    scope.domElement.removeEventListener( 'mousemove', onMouseMove, false )
    scope.domElement.removeEventListener( 'mouseup', onMouseUp, false )
    scope.dispatchEvent( endEvent )
    state = STATE.NONE


  onMouseWheel = ( event ) ->

    if ( scope.enabled == false || scope.noZoom == true ) then return

    event.preventDefault()
    event.stopPropagation()

    delta = 0

    if event.wheelDelta? # WebKit / Opera / Explorer 9
      delta = event.wheelDelta
    else if event.detail? # Firefox
      delta = - event.detail

    if ( delta > 0 )
      scope.dollyOut()
    else
      scope.dollyIn()

    scope.update()
    scope.dispatchEvent( startEvent )
    scope.dispatchEvent( endEvent )


  onKeyDown = ( event ) ->

    if ( scope.enabled == false || scope.noKeys == true || scope.noPan == true ) then return

    switch ( event.keyCode )

      when scope.keys.UP
        scope.pan( 0, scope.keyPanSpeed )
        scope.update()

      when scope.keys.BOTTOM
        scope.pan( 0, - scope.keyPanSpeed )
        scope.update()

      when scope.keys.LEFT
        scope.pan( scope.keyPanSpeed, 0 )
        scope.update()

      when scope.keys.RIGHT
        scope.pan( - scope.keyPanSpeed, 0 )
        scope.update()

  touchstart = ( event ) ->

    if ( scope.enabled == false ) then return

    switch ( event.touches.length )

      when 1 # one-fingered touch: rotate

        if ( scope.noRotate == true ) then return

        state = STATE.TOUCH_ROTATE

        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )

      when 2 # two-fingered touch: dolly

        if ( scope.noZoom == true ) then return

        state = STATE.TOUCH_DOLLY

        dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX
        dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY
        distance = Math.sqrt( dx * dx + dy * dy )
        dollyStart.set( 0, distance )

      when 3 # three-fingered touch: pan

        if ( scope.noPan == true ) then return

        state = STATE.TOUCH_PAN

        panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )

      else

        state = STATE.NONE

    scope.dispatchEvent( startEvent )


  touchmove = ( event ) ->

    if ( scope.enabled == false ) then return

    event.preventDefault()
    event.stopPropagation()

    element = if scope.domElement == document then scope.domElement.body else scope.domElement

    switch ( event.touches.length )

      when 1 # one-fingered touch: rotate

        if ( scope.noRotate == true ) then return
        if ( state != STATE.TOUCH_ROTATE ) then return

        rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )
        rotateDelta.subVectors( rotateEnd, rotateStart )

        # rotating across whole screen goes 360 degrees around
        scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed )
        # rotating up and down along whole screen attempts to go 360, but limited to 180
        scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed )

        rotateStart.copy( rotateEnd )

        scope.update()

      when 2 # two-fingered touch: dolly

        if ( scope.noZoom == true ) then return
        if ( state != STATE.TOUCH_DOLLY ) then return

        dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX
        dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY
        distance = Math.sqrt( dx * dx + dy * dy )

        dollyEnd.set( 0, distance )
        dollyDelta.subVectors( dollyEnd, dollyStart )

        if ( dollyDelta.y > 0 )
          scope.dollyOut()
        else
          scope.dollyIn()

        dollyStart.copy( dollyEnd )

        scope.update()

      when 3 # three-fingered touch: pan

        if ( scope.noPan == true ) then return
        if ( state != STATE.TOUCH_PAN ) then return

        panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )
        panDelta.subVectors( panEnd, panStart )

        scope.pan( panDelta.x, panDelta.y )

        panStart.copy( panEnd )

        scope.update()

      else

        state = STATE.NONE


  touchend = () ->

    if ( scope.enabled == false ) then return

    scope.dispatchEvent( endEvent )
    state = STATE.NONE


  @domElement.addEventListener( 'contextmenu', (( event ) -> event.preventDefault()), false )
  @domElement.addEventListener( 'mousedown', onMouseDown, false )
  @domElement.addEventListener( 'mousewheel', onMouseWheel, false )
  @domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ) # firefox

  @domElement.addEventListener( 'touchstart', touchstart, false )
  @domElement.addEventListener( 'touchend', touchend, false )
  @domElement.addEventListener( 'touchmove', touchmove, false )

  window.addEventListener( 'keydown', onKeyDown, false )

  # force an update at start
  @update()

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype )
