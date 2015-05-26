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
              dragOptions: {},
              overlays: [
                  [ "Label", {
                      location: [0.5, 1.5],
                      label: "Drag",
                      cssClass: "endpointSourceLabel"
                  } ]
              ]
          },
      // the definition of target endpoints (will appear when the user drags a connection)
          targetEndpoint = {
              endpoint: "Dot",
              paintStyle: { fillStyle: "#7AB02C", radius: 11 },
              hoverPaintStyle: endpointHoverStyle,
              maxConnections: -1,
              dropOptions: { hoverClass: "hover", activeClass: "active" },
              isTarget: true,
              overlays: [
                  [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel" } ]
              ]
          },
          init = function (connection) {
              connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
          };

      var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
          for (var i = 0; i < sourceAnchors.length; i++) {
              var sourceUUID = toId + sourceAnchors[i];
              console.log(sourceUUID);
              instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                  anchor: sourceAnchors[i], uuid: sourceUUID
              });
          }
          for (var j = 0; j < targetAnchors.length; j++) {
              var targetUUID = toId + targetAnchors[j];
              instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
          }
      };

      // suspend drawing and initialise.
      //instance.batch(function () {

          // listen for new connections; initialise them the same way we initialise the connections at startup.
          instance.bind("connection", function (connInfo, originalEvent) {
              init(connInfo.connection);
          });

          // make all the window divs draggable
          instance.draggable($(".flowchart-demo .window"), { 
            grid: [12, 12],
            start: function (params) {
              console.log('started drag');
              // TODO Lock object instance to this user
            },
            drag: function (params) {
              console.log('dragging');
              // TODO Update transient component instance x,y (top,left)
            },
            stop: function (params) {
              console.log('finished drag');
              // TODO Update component instance x,y (top,left)
              Meteor.call('test');
              // TODO Unlok object instance
            }
          });

          /*
          _addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
          _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
          _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
          _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

          // connect a few up
          instance.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
          instance.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
          instance.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
          instance.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
          instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
          instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});
          */

          /* End points ******************************************************/
          // TODO Should be in the object
          // Power
          instance.addEndpoint('object__power', sourceEndpoint, { anchor: 'BottomCenter', uuid: 'power_out' });

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
