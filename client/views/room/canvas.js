Template.canvas.helpers({
  objectInstances: function() {
    return ObjectInstances.find();
  },
  objectInstancePower: function() {
    return ObjectInstances.findOne({ name: 'Power' });
  },
  objectInstanceGround: function() {
    return ObjectInstances.findOne({ name: 'Ground' });
  },
  objectInstancePWMInput: function() {
    return ObjectInstances.findOne({ name: 'PWM Input' });
  },
  objectInstanceRGBLED: function() {
    return ObjectInstances.findOne({ name: 'RGB LED' });
  },
  objectInstanceRGBSensor: function() {
    return ObjectInstances.findOne({ name: 'RGB Sensor' });
  },
  objectInstanceRGBOutput: function() {
    return ObjectInstances.findOne({ name: 'RGB Output' });
  },
  objectInstancePWMOutput: function() {
    return ObjectInstances.findOne({ name: 'PWM Output' });
  }
});

Template.canvas.events({
});

Template['canvas'].viewmodel({
  // TODO bool for if controlled
});

Template.canvas.rendered = function() {
  jsPlumb.ready(function () {

      var instance = jsPlumb.getInstance({
          // default drag options
          DragOptions: { cursor: 'pointer', zIndex: 2000 },
          // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
          // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
          ConnectionOverlays: [
              [ "Arrow", { location: 1 } ],
              [ "Label", {
                  location: 0.1,
                  id: "label",
                  cssClass: "aLabel"
              }]
          ],
          Container: "flowchart-demo"
      });

      var basicType = {
          connector: "StateMachine",
          paintStyle: { strokeStyle: "red", lineWidth: 4 },
          hoverPaintStyle: { strokeStyle: "blue" },
          overlays: [
              "Arrow"
          ]
      };
      instance.registerConnectionType("basic", basicType);

      // this is the paint style for the connecting lines..
      var connectorPaintStyle = {
              lineWidth: 4,
              strokeStyle: "#61B7CF",
              joinstyle: "round",
              outlineColor: "white",
              outlineWidth: 2
          },
      // .. and this is the hover style.
          connectorHoverStyle = {
              lineWidth: 4,
              strokeStyle: "#216477",
              outlineWidth: 2,
              outlineColor: "white"
          },
          endpointHoverStyle = {
              fillStyle: "#216477",
              strokeStyle: "#216477"
          },
      // the definition of source endpoints (the small blue ones)
          sourceEndpoint = {
              endpoint: "Dot",
              paintStyle: {
                  strokeStyle: "#7AB02C",
                  fillStyle: "transparent",
                  radius: 7,
                  lineWidth: 3
              },
              isSource: true,
              connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
              connectorStyle: connectorPaintStyle,
              hoverPaintStyle: endpointHoverStyle,
              connectorHoverStyle: connectorHoverStyle,
              hoverPaintStyle: endpointHoverStyle,
              maxConnections: -1,
              dragOptions: {},
              isTarget: false,
              /*
              overlays: [
                  [ "Label", {
                      location: [0.5, 1.5],
                      label: "Drag",
                      cssClass: "endpointSourceLabel"
                  } ]
              ]
              */
          },
      // the definition of target endpoints (will appear when the user drags a connection)
          targetEndpoint = {
              endpoint: "Dot",
              paintStyle: { fillStyle: "#7AB02C", radius: 11 },
              hoverPaintStyle: endpointHoverStyle,
              maxConnections: -1,
              dropOptions: { hoverClass: "hover", activeClass: "active" },
              isTarget: true,
              /*
              overlays: [
                  [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel" } ]
              ]
              */
          },
          init = function (connection) {
              connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
          };

      // suspend drawing and initialise.
      //instance.batch(function () {

          // listen for new connections; initialise them the same way we initialise the connections at startup.
          instance.bind("connection", function (connInfo, originalEvent) {
              //init(connInfo.connection);
          });

          // make all the window divs draggable
          instance.draggable($(".flowchart-demo .window"), { 
            grid: [12, 12],
            start: function (params) {
              // Lock object instance to this user
              Meteor.call('lock', $(params.el).data('id'));
            },
            drag: function (params) {
              // Update transient component instance x,y (top,left)
              Meteor.call('updatePosition', $(params.el).data('id'), $(params.el).offset().top, $(params.el).offset().left);
            },
            stop: function (params) {
              // Update component instance x,y (top,left) and unlock
              Meteor.call('unlock', $(params.el).data('id'), $(params.el).offset().top, $(params.el).offset().left);
            }
          });

          /* End points ******************************************************/
          // TODO Should be in the object
          // Power
          instance.addEndpoint('object__power', sourceEndpoint, { anchor: 'BottomCenter', uuid: 'power_out' });

          // Ground
          instance.addEndpoint('object__ground', targetEndpoint, { anchor: 'TopCenter', uuid: 'ground_in' });

          // PWM Input
          instance.addEndpoint('object__pwm_input', sourceEndpoint, { anchor: 'Left', uuid: 'pwm_input_out' });

          // PWM Output (graph)
          instance.addEndpoint('object__pwm_output', targetEndpoint, { anchor: 'Right', uuid: 'pwm_output_out_pwm' });

          // RGB LED
          instance.addEndpoint('object__rgb_led', targetEndpoint, { anchor: 'TopCenter', uuid: 'rgb_led_in_power' });
          instance.addEndpoint('object__rgb_led', targetEndpoint, { anchor: 'Left', uuid: 'rgb_led_in_pwm' });
          instance.addEndpoint('object__rgb_led', sourceEndpoint, { anchor: 'BottomCenter', uuid: 'rgb_led_out_ground' });
          instance.addEndpoint('object__rgb_led', sourceEndpoint, { anchor: 'Right', uuid: 'rgb_led_out_sensor' });

          // RGB Output
          instance.addEndpoint('object__rgb_output', targetEndpoint, { anchor: 'Left', uuid: 'rgb_output_in_sensor' });

          // RGB Sensor
          instance.addEndpoint('object__rgb_sensor', sourceEndpoint, { anchor: 'TopCenter', uuid: 'rgb_sensor_out_ground' });
          instance.addEndpoint('object__rgb_sensor', targetEndpoint, { anchor: 'Left', uuid: 'rgb_sensor_in_led' });
          instance.addEndpoint('object__rgb_sensor', targetEndpoint, { anchor: 'Right', uuid: 'rgb_sensor_in_power' });
          instance.addEndpoint('object__rgb_sensor', sourceEndpoint, { anchor: 'BottomCenter', uuid: 'rgb_sensor_out_output' });

          /* Conections ******************************************************/
          // Power -> RGB LED
          instance.connect({uuids: ['power_out', 'rgb_led_in_power'], editable: false});
          // Power -> RGB Sensor
          instance.connect({uuids: ['power_out', 'rgb_sensor_in_power'], editable: false});

          // RGB LED -> Ground
          instance.connect({uuids: ['rgb_led_out_ground', 'ground_in'], editable: false});
          // RGB Sensor -> Ground
          instance.connect({uuids: ['rgb_sensor_out_ground','ground_in'], editable: false});

          // PWM Input -> RGB LED
          instance.connect({uuids: ['pwm_input_out', 'rgb_led_in_pwm'], editable: false});
          // PWM Input -> PWM Output (graph)
          instance.connect({uuids: ['pwm_input_out', 'pwm_output_out_pwm'], editable: false});

          // RGB LED -> RGB Sensor
          instance.connect({uuids: ['rgb_led_out_sensor', 'rgb_sensor_in_led'], editable: false});

          // RGB Sensor -> RGB Output
          instance.connect({uuids: ['rgb_sensor_out_output', 'rgb_output_in_sensor'], editable: false});


          // listen for clicks on connections, and offer to delete connections on click.
          instance.bind("click", function (conn, originalEvent) {
             // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
               //   instance.detach(conn);
              conn.toggleType("basic");
          });

          instance.bind("connectionDrag", function (connection) {
              console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
          });

          instance.bind("connectionDragStop", function (connection) {
              console.log("connection " + connection.id + " was dragged");
          });

          instance.bind("connectionMoved", function (params) {
              console.log("connection " + params.connection.id + " was moved");
          });
      //});
  });
};
