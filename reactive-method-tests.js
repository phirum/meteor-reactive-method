if (Meteor.isServer) {
  Meteor.methods({
    joinStrings: function (a, b) {
      return a + ", " + b;
    }
  });
} else {
  testAsyncMulti("throws error outside of autorun", [
    function (test, expect) {
      var error;
      try {
        ReactiveMethod.call("joinStrings", "a", "b");
      } catch (e) {
        error = e;
      }

      test.equal(error.message, "Don't use ReactiveMethod.call outside of a Tracker computation.");
    },
    function (test, expect) {
      var error;
      try {
        ReactiveMethod.apply("joinStrings", "a", "b");
      } catch (e) {
        error = e;
      }

      test.equal(error.message, "Don't use ReactiveMethod.apply outside of a Tracker computation.");
    }
  ]);

  testAsyncMulti("returns correct value", [
    function (test, expect) {
      var checkedResult = expect();

      Tracker.autorun(function (computation) {
        var result = ReactiveMethod.call("joinStrings", "a", "b");

        if (! computation.firstRun) {
          test.equal(result, "a, b");

          setTimeout(function () {
            checkedResult();
          }, 0);
        }
      });
    },
    function (test, expect) {
      var checkedResult = expect();

      Tracker.autorun(function (computation) {
        var result = ReactiveMethod.apply("joinStrings", ["a", "b"]);

        if (! computation.firstRun) {
          test.equal(result, "a, b");

          setTimeout(function () {
            checkedResult();
          }, 0);
        }
      });
    }
  ]);

  testAsyncMulti("avoid extra reruns", [
    function (test, expect) {
      var done = expect();
      var reruns = 0;
      var argVar = new ReactiveVar(1);

      Tracker.autorun(function () {
        // just to trigger recomputation
        argVar.get();
        ReactiveMethod.call("joinStrings", "a", "b");
        reruns ++;
      });

      argVar.set(2);
      argVar.set(3);

      setTimeout(function () {
        // I can't think any way to check how many reruns happen without
        // setting a strict timeout
        test.equal(reruns, 2);
        done();
      }, 1000);
    }
  ]);
}