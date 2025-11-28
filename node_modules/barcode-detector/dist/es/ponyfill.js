var Ie = (o) => {
  throw TypeError(o);
};
var Me = (o, l, h) => l.has(o) || Ie("Cannot " + h);
var Fe = (o, l, h) => (Me(o, l, "read from private field"), h ? h.call(o) : l.get(o)), je = (o, l, h) => l.has(o) ? Ie("Cannot add the same private member more than once") : l instanceof WeakSet ? l.add(o) : l.set(o, h), Re = (o, l, h, f) => (Me(o, l, "write to private field"), f ? f.call(o, h) : l.set(o, h), h);
const Ft = [
  ["Aztec", "M"],
  ["Codabar", "L"],
  ["Code39", "L"],
  ["Code93", "L"],
  ["Code128", "L"],
  ["DataBar", "L"],
  ["DataBarExpanded", "L"],
  ["DataMatrix", "M"],
  ["EAN-8", "L"],
  ["EAN-13", "L"],
  ["ITF", "L"],
  ["MaxiCode", "M"],
  ["PDF417", "M"],
  ["QRCode", "M"],
  ["UPC-A", "L"],
  ["UPC-E", "L"],
  ["MicroQRCode", "M"],
  ["rMQRCode", "M"],
  ["DXFilmEdge", "L"],
  ["DataBarLimited", "L"]
], jt = Ft.map(([o]) => o), Ba = jt.filter(
  (o, l) => Ft[l][1] === "L"
), Wa = jt.filter(
  (o, l) => Ft[l][1] === "M"
);
function Qt(o) {
  switch (o) {
    case "Linear-Codes":
      return Ba.reduce((l, h) => l | Qt(h), 0);
    case "Matrix-Codes":
      return Wa.reduce((l, h) => l | Qt(h), 0);
    case "Any":
      return (1 << Ft.length) - 1;
    case "None":
      return 0;
    default:
      return 1 << jt.indexOf(o);
  }
}
function Ua(o) {
  if (o === 0)
    return "None";
  const l = 31 - Math.clz32(o);
  return jt[l];
}
function Va(o) {
  return o.reduce((l, h) => l | Qt(h), 0);
}
const ka = [
  "LocalAverage",
  "GlobalHistogram",
  "FixedThreshold",
  "BoolCast"
];
function Ha(o) {
  return ka.indexOf(o);
}
const Le = [
  "Unknown",
  "ASCII",
  "ISO8859_1",
  "ISO8859_2",
  "ISO8859_3",
  "ISO8859_4",
  "ISO8859_5",
  "ISO8859_6",
  "ISO8859_7",
  "ISO8859_8",
  "ISO8859_9",
  "ISO8859_10",
  "ISO8859_11",
  "ISO8859_13",
  "ISO8859_14",
  "ISO8859_15",
  "ISO8859_16",
  "Cp437",
  "Cp1250",
  "Cp1251",
  "Cp1252",
  "Cp1256",
  "Shift_JIS",
  "Big5",
  "GB2312",
  "GB18030",
  "EUC_JP",
  "EUC_KR",
  "UTF16BE",
  /**
   * UnicodeBig [[deprecated]]
   */
  "UTF16BE",
  "UTF8",
  "UTF16LE",
  "UTF32BE",
  "UTF32LE",
  "BINARY"
];
function Na(o) {
  return o === "UnicodeBig" ? Le.indexOf("UTF16BE") : Le.indexOf(o);
}
const za = [
  "Text",
  "Binary",
  "Mixed",
  "GS1",
  "ISO15434",
  "UnknownECI"
];
function Ga(o) {
  return za[o];
}
const Xa = ["Ignore", "Read", "Require"];
function qa(o) {
  return Xa.indexOf(o);
}
const Ya = ["Plain", "ECI", "HRI", "Hex", "Escaped"];
function Za(o) {
  return Ya.indexOf(o);
}
const Mt = {
  formats: [],
  tryHarder: !0,
  tryRotate: !0,
  tryInvert: !0,
  tryDownscale: !0,
  tryDenoise: !1,
  binarizer: "LocalAverage",
  isPure: !1,
  downscaleFactor: 3,
  downscaleThreshold: 500,
  minLineCount: 2,
  maxNumberOfSymbols: 255,
  tryCode39ExtendedMode: !0,
  returnErrors: !1,
  eanAddOnSymbol: "Ignore",
  textMode: "HRI",
  characterSet: "Unknown"
};
function Be(o) {
  return {
    ...o,
    formats: Va(o.formats),
    binarizer: Ha(o.binarizer),
    eanAddOnSymbol: qa(o.eanAddOnSymbol),
    textMode: Za(o.textMode),
    characterSet: Na(o.characterSet)
  };
}
function Qa(o) {
  return {
    ...o,
    format: Ua(o.format),
    contentType: Ga(o.contentType),
    eccLevel: o.ecLevel
  };
}
const bo = "2.2.2", Co = "c0a7c6cd2165457c721c58045edd22ffee9624e9", Ja = {
  locateFile: (o, l) => {
    const h = o.match(/_(.+?)\.wasm$/);
    return h ? `https://fastly.jsdelivr.net/npm/zxing-wasm@2.2.2/dist/${h[1]}/${o}` : l + o;
  }
}, It = /* @__PURE__ */ new WeakMap();
function Ka(o, l) {
  return Object.is(o, l) || Object.keys(o).length === Object.keys(l).length && Object.keys(o).every(
    (h) => Object.hasOwn(l, h) && o[h] === l[h]
  );
}
function Ue(o, {
  overrides: l,
  equalityFn: h = Ka,
  fireImmediately: f = !1
} = {}) {
  var C;
  const [O, I] = (C = It.get(o)) != null ? C : [Ja], j = l != null ? l : O;
  let x;
  if (f) {
    if (I && (x = h(O, j)))
      return I;
    const M = o({
      ...j
    });
    return It.set(o, [j, M]), M;
  }
  (x != null ? x : h(O, j)) || It.set(o, [j]);
}
function to(o) {
  It.delete(o);
}
async function eo(o, l, h = Mt) {
  const f = {
    ...Mt,
    ...h
  }, C = await Ue(o, {
    fireImmediately: !0
  });
  let O, I;
  if ("width" in l && "height" in l && "data" in l) {
    const {
      data: x,
      data: { byteLength: M },
      width: z,
      height: X
    } = l;
    I = C._malloc(M), C.HEAPU8.set(x, I), O = C.readBarcodesFromPixmap(
      I,
      z,
      X,
      Be(f)
    );
  } else {
    let x, M;
    if ("buffer" in l)
      [x, M] = [l.byteLength, l];
    else if ("byteLength" in l)
      [x, M] = [l.byteLength, new Uint8Array(l)];
    else if ("size" in l)
      [x, M] = [l.size, new Uint8Array(await l.arrayBuffer())];
    else
      throw new TypeError("Invalid input type");
    I = C._malloc(x), C.HEAPU8.set(M, I), O = C.readBarcodesFromImage(
      I,
      x,
      Be(f)
    );
  }
  C._free(I);
  const j = [];
  for (let x = 0; x < O.size(); ++x)
    j.push(
      Qa(O.get(x))
    );
  return j;
}
({
  ...Mt,
  formats: [...Mt.formats]
});
var Kt = async function(o = {}) {
  var l, h, f = o, C, O, I = new Promise((e, t) => {
    C = e, O = t;
  }), j = typeof window == "object", x = typeof Bun < "u", M = typeof WorkerGlobalScope < "u";
  typeof process == "object" && !((h = process.versions) === null || h === void 0) && h.node && process.type != "renderer";
  var z = "./this.program", X, q = "";
  function it(e) {
    return f.locateFile ? f.locateFile(e, q) : q + e;
  }
  var st, et;
  if (j || M || x) {
    try {
      q = new URL(".", X).href;
    } catch {
    }
    M && (et = (e) => {
      var t = new XMLHttpRequest();
      return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
    }), st = async (e) => {
      var t = await fetch(e, {
        credentials: "same-origin"
      });
      if (t.ok)
        return t.arrayBuffer();
      throw new Error(t.status + " : " + t.url);
    };
  }
  var vt = console.log.bind(console), G = console.error.bind(console), ut, yt, te = !1, Y, B, mt, rt, nt, P, ee, re;
  function ne() {
    var e = yt.buffer;
    Y = new Int8Array(e), mt = new Int16Array(e), f.HEAPU8 = B = new Uint8Array(e), rt = new Uint16Array(e), nt = new Int32Array(e), P = new Uint32Array(e), ee = new Float32Array(e), re = new Float64Array(e);
  }
  function Qe() {
    if (f.preRun)
      for (typeof f.preRun == "function" && (f.preRun = [f.preRun]); f.preRun.length; )
        lr(f.preRun.shift());
    ae(ie);
  }
  function Je() {
    _.ya();
  }
  function Ke() {
    if (f.postRun)
      for (typeof f.postRun == "function" && (f.postRun = [f.postRun]); f.postRun.length; )
        cr(f.postRun.shift());
    ae(oe);
  }
  var Z = 0, ct = null;
  function tr(e) {
    var t;
    Z++, (t = f.monitorRunDependencies) === null || t === void 0 || t.call(f, Z);
  }
  function er(e) {
    var t;
    if (Z--, (t = f.monitorRunDependencies) === null || t === void 0 || t.call(f, Z), Z == 0 && ct) {
      var r = ct;
      ct = null, r();
    }
  }
  function Rt(e) {
    var t;
    (t = f.onAbort) === null || t === void 0 || t.call(f, e), e = "Aborted(" + e + ")", G(e), te = !0, e += ". Build with -sASSERTIONS for more info.";
    var r = new WebAssembly.RuntimeError(e);
    throw O(r), r;
  }
  var gt;
  function rr() {
    return it("zxing_reader.wasm");
  }
  function nr(e) {
    if (e == gt && ut)
      return new Uint8Array(ut);
    if (et)
      return et(e);
    throw "both async and sync fetching of the wasm failed";
  }
  async function ar(e) {
    if (!ut)
      try {
        var t = await st(e);
        return new Uint8Array(t);
      } catch {
      }
    return nr(e);
  }
  async function or(e, t) {
    try {
      var r = await ar(e), n = await WebAssembly.instantiate(r, t);
      return n;
    } catch (a) {
      G(`failed to asynchronously prepare wasm: ${a}`), Rt(a);
    }
  }
  async function ir(e, t, r) {
    if (!e && typeof WebAssembly.instantiateStreaming == "function")
      try {
        var n = fetch(t, {
          credentials: "same-origin"
        }), a = await WebAssembly.instantiateStreaming(n, r);
        return a;
      } catch (i) {
        G(`wasm streaming compile failed: ${i}`), G("falling back to ArrayBuffer instantiation");
      }
    return or(t, r);
  }
  function sr() {
    return {
      a: Nn
    };
  }
  async function ur() {
    function e(i, u) {
      return _ = i.exports, yt = _.xa, ne(), ye = _.Ba, er(), _;
    }
    tr();
    function t(i) {
      return e(i.instance);
    }
    var r = sr();
    if (f.instantiateWasm)
      return new Promise((i, u) => {
        f.instantiateWasm(r, (s, c) => {
          i(e(s));
        });
      });
    gt != null || (gt = rr());
    try {
      var n = await ir(ut, gt, r), a = t(n);
      return a;
    } catch (i) {
      return O(i), Promise.reject(i);
    }
  }
  var ae = (e) => {
    for (; e.length > 0; )
      e.shift()(f);
  }, oe = [], cr = (e) => oe.push(e), ie = [], lr = (e) => ie.push(e), m = (e) => qn(e), g = () => Yn(), wt = [], $t = 0, fr = (e) => {
    var t = new Lt(e);
    return t.get_caught() || (t.set_caught(!0), $t--), t.set_rethrown(!1), wt.push(t), Qn(e), Gn(e);
  }, V = 0, dr = () => {
    y(0, 0);
    var e = wt.pop();
    Zn(e.excPtr), V = 0;
  };
  class Lt {
    constructor(t) {
      this.excPtr = t, this.ptr = t - 24;
    }
    set_type(t) {
      P[this.ptr + 4 >> 2] = t;
    }
    get_type() {
      return P[this.ptr + 4 >> 2];
    }
    set_destructor(t) {
      P[this.ptr + 8 >> 2] = t;
    }
    get_destructor() {
      return P[this.ptr + 8 >> 2];
    }
    set_caught(t) {
      t = t ? 1 : 0, Y[this.ptr + 12] = t;
    }
    get_caught() {
      return Y[this.ptr + 12] != 0;
    }
    set_rethrown(t) {
      t = t ? 1 : 0, Y[this.ptr + 13] = t;
    }
    get_rethrown() {
      return Y[this.ptr + 13] != 0;
    }
    init(t, r) {
      this.set_adjusted_ptr(0), this.set_type(t), this.set_destructor(r);
    }
    set_adjusted_ptr(t) {
      P[this.ptr + 16 >> 2] = t;
    }
    get_adjusted_ptr() {
      return P[this.ptr + 16 >> 2];
    }
  }
  var bt = (e) => Xn(e), Bt = (e) => {
    var t = V;
    if (!t)
      return bt(0), 0;
    var r = new Lt(t);
    r.set_adjusted_ptr(t);
    var n = r.get_type();
    if (!n)
      return bt(0), t;
    for (var a of e) {
      if (a === 0 || a === n)
        break;
      var i = r.ptr + 16;
      if (Jn(a, n, i))
        return bt(a), t;
    }
    return bt(n), t;
  }, hr = () => Bt([]), pr = (e) => Bt([e]), vr = (e, t) => Bt([e, t]), yr = () => {
    var e = wt.pop();
    e || Rt("no exception to throw");
    var t = e.excPtr;
    throw e.get_rethrown() || (wt.push(e), e.set_rethrown(!0), e.set_caught(!1), $t++), V = t, V;
  }, mr = (e, t, r) => {
    var n = new Lt(e);
    throw n.init(t, r), V = e, $t++, V;
  }, gr = () => $t, wr = (e) => {
    throw V || (V = e), V;
  }, $r = () => Rt(""), Ct = {}, Wt = (e) => {
    for (; e.length; ) {
      var t = e.pop(), r = e.pop();
      r(t);
    }
  };
  function lt(e) {
    return this.fromWireType(P[e >> 2]);
  }
  var at = {}, Q = {}, Tt = {}, br = class extends Error {
    constructor(e) {
      super(e), this.name = "InternalError";
    }
  }, Pt = (e) => {
    throw new br(e);
  }, J = (e, t, r) => {
    e.forEach((s) => Tt[s] = t);
    function n(s) {
      var c = r(s);
      c.length !== e.length && Pt("Mismatched type converter count");
      for (var d = 0; d < e.length; ++d)
        U(e[d], c[d]);
    }
    var a = new Array(t.length), i = [], u = 0;
    t.forEach((s, c) => {
      Q.hasOwnProperty(s) ? a[c] = Q[s] : (i.push(s), at.hasOwnProperty(s) || (at[s] = []), at[s].push(() => {
        a[c] = Q[s], ++u, u === i.length && n(a);
      }));
    }), i.length === 0 && n(a);
  }, Cr = (e) => {
    var t = Ct[e];
    delete Ct[e];
    var r = t.rawConstructor, n = t.rawDestructor, a = t.fields, i = a.map((u) => u.getterReturnType).concat(a.map((u) => u.setterArgumentType));
    J([e], i, (u) => {
      var s = {};
      return a.forEach((c, d) => {
        var p = c.fieldName, v = u[d], $ = u[d].optional, b = c.getter, E = c.getterContext, S = u[d + a.length], A = c.setter, D = c.setterContext;
        s[p] = {
          read: (N) => v.fromWireType(b(E, N)),
          write: (N, R) => {
            var L = [];
            A(D, N, S.toWireType(L, R)), Wt(L);
          },
          optional: $
        };
      }), [{
        name: t.name,
        fromWireType: (c) => {
          var d = {};
          for (var p in s)
            d[p] = s[p].read(c);
          return n(c), d;
        },
        toWireType: (c, d) => {
          for (var p in s)
            if (!(p in d) && !s[p].optional)
              throw new TypeError(`Missing field: "${p}"`);
          var v = r();
          for (p in s)
            s[p].write(v, d[p]);
          return c !== null && c.push(n, v), v;
        },
        argPackAdvance: k,
        readValueFromPointer: lt,
        destructorFunction: n
      }];
    });
  }, Tr = (e, t, r, n, a) => {
  }, Pr = () => {
    for (var e = new Array(256), t = 0; t < 256; ++t)
      e[t] = String.fromCharCode(t);
    se = e;
  }, se, F = (e) => {
    for (var t = "", r = e; B[r]; )
      t += se[B[r++]];
    return t;
  }, ft = class extends Error {
    constructor(e) {
      super(e), this.name = "BindingError";
    }
  }, T = (e) => {
    throw new ft(e);
  };
  function _r(e, t) {
    let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var n = t.name;
    if (e || T(`type "${n}" must have a positive integer typeid pointer`), Q.hasOwnProperty(e)) {
      if (r.ignoreDuplicateRegistrations)
        return;
      T(`Cannot register type '${n}' twice`);
    }
    if (Q[e] = t, delete Tt[e], at.hasOwnProperty(e)) {
      var a = at[e];
      delete at[e], a.forEach((i) => i());
    }
  }
  function U(e, t) {
    let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return _r(e, t, r);
  }
  var k = 8, Er = (e, t, r, n) => {
    t = F(t), U(e, {
      name: t,
      fromWireType: function(a) {
        return !!a;
      },
      toWireType: function(a, i) {
        return i ? r : n;
      },
      argPackAdvance: k,
      readValueFromPointer: function(a) {
        return this.fromWireType(B[a]);
      },
      destructorFunction: null
    });
  }, Or = (e) => ({
    count: e.count,
    deleteScheduled: e.deleteScheduled,
    preservePointerOnDelete: e.preservePointerOnDelete,
    ptr: e.ptr,
    ptrType: e.ptrType,
    smartPtr: e.smartPtr,
    smartPtrType: e.smartPtrType
  }), Ut = (e) => {
    function t(r) {
      return r.$$.ptrType.registeredClass.name;
    }
    T(t(e) + " instance already deleted");
  }, Vt = !1, ue = (e) => {
  }, xr = (e) => {
    e.smartPtr ? e.smartPtrType.rawDestructor(e.smartPtr) : e.ptrType.registeredClass.rawDestructor(e.ptr);
  }, ce = (e) => {
    e.count.value -= 1;
    var t = e.count.value === 0;
    t && xr(e);
  }, dt = (e) => typeof FinalizationRegistry > "u" ? (dt = (t) => t, e) : (Vt = new FinalizationRegistry((t) => {
    ce(t.$$);
  }), dt = (t) => {
    var r = t.$$, n = !!r.smartPtr;
    if (n) {
      var a = {
        $$: r
      };
      Vt.register(t, a, t);
    }
    return t;
  }, ue = (t) => Vt.unregister(t), dt(e)), Ar = () => {
    let e = _t.prototype;
    Object.assign(e, {
      isAliasOf(r) {
        if (!(this instanceof _t) || !(r instanceof _t))
          return !1;
        var n = this.$$.ptrType.registeredClass, a = this.$$.ptr;
        r.$$ = r.$$;
        for (var i = r.$$.ptrType.registeredClass, u = r.$$.ptr; n.baseClass; )
          a = n.upcast(a), n = n.baseClass;
        for (; i.baseClass; )
          u = i.upcast(u), i = i.baseClass;
        return n === i && a === u;
      },
      clone() {
        if (this.$$.ptr || Ut(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r = dt(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: Or(this.$$)
          }
        }));
        return r.$$.count.value += 1, r.$$.deleteScheduled = !1, r;
      },
      delete() {
        this.$$.ptr || Ut(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), ue(this), ce(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      },
      isDeleted() {
        return !this.$$.ptr;
      },
      deleteLater() {
        return this.$$.ptr || Ut(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      }
    });
    const t = Symbol.dispose;
    t && (e[t] = e.delete);
  };
  function _t() {
  }
  var kt = (e, t) => Object.defineProperty(t, "name", {
    value: e
  }), le = {}, fe = (e, t, r) => {
    if (e[t].overloadTable === void 0) {
      var n = e[t];
      e[t] = function() {
        for (var a = arguments.length, i = new Array(a), u = 0; u < a; u++)
          i[u] = arguments[u];
        return e[t].overloadTable.hasOwnProperty(i.length) || T(`Function '${r}' called with an invalid number of arguments (${i.length}) - expects one of (${e[t].overloadTable})!`), e[t].overloadTable[i.length].apply(this, i);
      }, e[t].overloadTable = [], e[t].overloadTable[n.argCount] = n;
    }
  }, de = (e, t, r) => {
    f.hasOwnProperty(e) ? ((r === void 0 || f[e].overloadTable !== void 0 && f[e].overloadTable[r] !== void 0) && T(`Cannot register public name '${e}' twice`), fe(f, e, e), f[e].overloadTable.hasOwnProperty(r) && T(`Cannot register multiple overloads of a function with the same number of arguments (${r})!`), f[e].overloadTable[r] = t) : (f[e] = t, f[e].argCount = r);
  }, Sr = 48, Dr = 57, Ir = (e) => {
    e = e.replace(/[^a-zA-Z0-9_]/g, "$");
    var t = e.charCodeAt(0);
    return t >= Sr && t <= Dr ? `_${e}` : e;
  };
  function Mr(e, t, r, n, a, i, u, s) {
    this.name = e, this.constructor = t, this.instancePrototype = r, this.rawDestructor = n, this.baseClass = a, this.getActualType = i, this.upcast = u, this.downcast = s, this.pureVirtualFunctions = [];
  }
  var Ht = (e, t, r) => {
    for (; t !== r; )
      t.upcast || T(`Expected null or instance of ${r.name}, got an instance of ${t.name}`), e = t.upcast(e), t = t.baseClass;
    return e;
  }, Nt = (e) => {
    if (e === null)
      return "null";
    var t = typeof e;
    return t === "object" || t === "array" || t === "function" ? e.toString() : "" + e;
  };
  function Fr(e, t) {
    if (t === null)
      return this.isReference && T(`null is not a valid ${this.name}`), 0;
    t.$$ || T(`Cannot pass "${Nt(t)}" as a ${this.name}`), t.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`);
    var r = t.$$.ptrType.registeredClass, n = Ht(t.$$.ptr, r, this.registeredClass);
    return n;
  }
  function jr(e, t) {
    var r;
    if (t === null)
      return this.isReference && T(`null is not a valid ${this.name}`), this.isSmartPointer ? (r = this.rawConstructor(), e !== null && e.push(this.rawDestructor, r), r) : 0;
    (!t || !t.$$) && T(`Cannot pass "${Nt(t)}" as a ${this.name}`), t.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && t.$$.ptrType.isConst && T(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
    var n = t.$$.ptrType.registeredClass;
    if (r = Ht(t.$$.ptr, n, this.registeredClass), this.isSmartPointer)
      switch (t.$$.smartPtr === void 0 && T("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
        case 0:
          t.$$.smartPtrType === this ? r = t.$$.smartPtr : T(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
          break;
        case 1:
          r = t.$$.smartPtr;
          break;
        case 2:
          if (t.$$.smartPtrType === this)
            r = t.$$.smartPtr;
          else {
            var a = t.clone();
            r = this.rawShare(r, H.toHandle(() => a.delete())), e !== null && e.push(this.rawDestructor, r);
          }
          break;
        default:
          T("Unsupporting sharing policy");
      }
    return r;
  }
  function Rr(e, t) {
    if (t === null)
      return this.isReference && T(`null is not a valid ${this.name}`), 0;
    t.$$ || T(`Cannot pass "${Nt(t)}" as a ${this.name}`), t.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), t.$$.ptrType.isConst && T(`Cannot convert argument of type ${t.$$.ptrType.name} to parameter type ${this.name}`);
    var r = t.$$.ptrType.registeredClass, n = Ht(t.$$.ptr, r, this.registeredClass);
    return n;
  }
  var he = (e, t, r) => {
    if (t === r)
      return e;
    if (r.baseClass === void 0)
      return null;
    var n = he(e, t, r.baseClass);
    return n === null ? null : r.downcast(n);
  }, Lr = {}, Br = (e, t) => {
    for (t === void 0 && T("ptr should not be undefined"); e.baseClass; )
      t = e.upcast(t), e = e.baseClass;
    return t;
  }, Wr = (e, t) => (t = Br(e, t), Lr[t]), Et = (e, t) => {
    (!t.ptrType || !t.ptr) && Pt("makeClassHandle requires ptr and ptrType");
    var r = !!t.smartPtrType, n = !!t.smartPtr;
    return r !== n && Pt("Both smartPtrType and smartPtr must be specified"), t.count = {
      value: 1
    }, dt(Object.create(e, {
      $$: {
        value: t,
        writable: !0
      }
    }));
  };
  function Ur(e) {
    var t = this.getPointee(e);
    if (!t)
      return this.destructor(e), null;
    var r = Wr(this.registeredClass, t);
    if (r !== void 0) {
      if (r.$$.count.value === 0)
        return r.$$.ptr = t, r.$$.smartPtr = e, r.clone();
      var n = r.clone();
      return this.destructor(e), n;
    }
    function a() {
      return this.isSmartPointer ? Et(this.registeredClass.instancePrototype, {
        ptrType: this.pointeeType,
        ptr: t,
        smartPtrType: this,
        smartPtr: e
      }) : Et(this.registeredClass.instancePrototype, {
        ptrType: this,
        ptr: e
      });
    }
    var i = this.registeredClass.getActualType(t), u = le[i];
    if (!u)
      return a.call(this);
    var s;
    this.isConst ? s = u.constPointerType : s = u.pointerType;
    var c = he(t, this.registeredClass, s.registeredClass);
    return c === null ? a.call(this) : this.isSmartPointer ? Et(s.registeredClass.instancePrototype, {
      ptrType: s,
      ptr: c,
      smartPtrType: this,
      smartPtr: e
    }) : Et(s.registeredClass.instancePrototype, {
      ptrType: s,
      ptr: c
    });
  }
  var Vr = () => {
    Object.assign(Ot.prototype, {
      getPointee(e) {
        return this.rawGetPointee && (e = this.rawGetPointee(e)), e;
      },
      destructor(e) {
        var t;
        (t = this.rawDestructor) === null || t === void 0 || t.call(this, e);
      },
      argPackAdvance: k,
      readValueFromPointer: lt,
      fromWireType: Ur
    });
  };
  function Ot(e, t, r, n, a, i, u, s, c, d, p) {
    this.name = e, this.registeredClass = t, this.isReference = r, this.isConst = n, this.isSmartPointer = a, this.pointeeType = i, this.sharingPolicy = u, this.rawGetPointee = s, this.rawConstructor = c, this.rawShare = d, this.rawDestructor = p, !a && t.baseClass === void 0 ? n ? (this.toWireType = Fr, this.destructorFunction = null) : (this.toWireType = Rr, this.destructorFunction = null) : this.toWireType = jr;
  }
  var pe = (e, t, r) => {
    f.hasOwnProperty(e) || Pt("Replacing nonexistent public symbol"), f[e].overloadTable !== void 0 && r !== void 0 ? f[e].overloadTable[r] = t : (f[e] = t, f[e].argCount = r);
  }, ve = [], ye, w = (e) => {
    var t = ve[e];
    return t || (ve[e] = t = ye.get(e)), t;
  }, kr = function(e, t) {
    let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    if (e.includes("j"))
      return dynCallLegacy(e, t, r);
    var n = w(t), a = n(...r);
    return a;
  }, Hr = function(e, t) {
    let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
    return function() {
      for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
        a[i] = arguments[i];
      return kr(e, t, a, r);
    };
  }, W = function(e, t) {
    e = F(e);
    function r() {
      if (e.includes("j"))
        return Hr(e, t);
      var a = w(t);
      return a;
    }
    var n = r();
    return typeof n != "function" && T(`unknown function pointer with signature ${e}: ${t}`), n;
  };
  class Nr extends Error {
  }
  var me = (e) => {
    var t = zn(e), r = F(t);
    return tt(t), r;
  }, xt = (e, t) => {
    var r = [], n = {};
    function a(i) {
      if (!n[i] && !Q[i]) {
        if (Tt[i]) {
          Tt[i].forEach(a);
          return;
        }
        r.push(i), n[i] = !0;
      }
    }
    throw t.forEach(a), new Nr(`${e}: ` + r.map(me).join([", "]));
  }, zr = (e, t, r, n, a, i, u, s, c, d, p, v, $) => {
    p = F(p), i = W(a, i), s && (s = W(u, s)), d && (d = W(c, d)), $ = W(v, $);
    var b = Ir(p);
    de(b, function() {
      xt(`Cannot construct ${p} due to unbound types`, [n]);
    }), J([e, t, r], n ? [n] : [], (E) => {
      E = E[0];
      var S, A;
      n ? (S = E.registeredClass, A = S.instancePrototype) : A = _t.prototype;
      var D = kt(p, function() {
        if (Object.getPrototypeOf(this) !== N)
          throw new ft(`Use 'new' to construct ${p}`);
        if (R.constructor_body === void 0)
          throw new ft(`${p} has no accessible constructor`);
        for (var Se = arguments.length, St = new Array(Se), Dt = 0; Dt < Se; Dt++)
          St[Dt] = arguments[Dt];
        var De = R.constructor_body[St.length];
        if (De === void 0)
          throw new ft(`Tried to invoke ctor of ${p} with invalid number of parameters (${St.length}) - expected (${Object.keys(R.constructor_body).toString()}) parameters instead!`);
        return De.apply(this, St);
      }), N = Object.create(A, {
        constructor: {
          value: D
        }
      });
      D.prototype = N;
      var R = new Mr(p, D, N, $, S, i, s, d);
      if (R.baseClass) {
        var L, At;
        (At = (L = R.baseClass).__derivedClasses) !== null && At !== void 0 || (L.__derivedClasses = []), R.baseClass.__derivedClasses.push(R);
      }
      var La = new Ot(p, R, !0, !1, !1), xe = new Ot(p + "*", R, !1, !1, !1), Ae = new Ot(p + " const*", R, !1, !0, !1);
      return le[e] = {
        pointerType: xe,
        constPointerType: Ae
      }, pe(b, D), [La, xe, Ae];
    });
  }, zt = (e, t) => {
    for (var r = [], n = 0; n < e; n++)
      r.push(P[t + n * 4 >> 2]);
    return r;
  };
  function Gr(e) {
    for (var t = 1; t < e.length; ++t)
      if (e[t] !== null && e[t].destructorFunction === void 0)
        return !0;
    return !1;
  }
  function Gt(e, t, r, n, a, i) {
    var u = t.length;
    u < 2 && T("argTypes array size mismatch! Must at least get return value and 'this' types!");
    var s = t[1] !== null && r !== null, c = Gr(t), d = t[0].name !== "void", p = u - 2, v = new Array(p), $ = [], b = [], E = function() {
      b.length = 0;
      var S;
      $.length = s ? 2 : 1, $[0] = a, s && (S = t[1].toWireType(b, this), $[1] = S);
      for (var A = 0; A < p; ++A)
        v[A] = t[A + 2].toWireType(b, A < 0 || arguments.length <= A ? void 0 : arguments[A]), $.push(v[A]);
      var D = n(...$);
      function N(R) {
        if (c)
          Wt(b);
        else
          for (var L = s ? 1 : 2; L < t.length; L++) {
            var At = L === 1 ? S : v[L - 2];
            t[L].destructorFunction !== null && t[L].destructorFunction(At);
          }
        if (d)
          return t[0].fromWireType(R);
      }
      return N(D);
    };
    return kt(e, E);
  }
  var Xr = (e, t, r, n, a, i) => {
    var u = zt(t, r);
    a = W(n, a), J([], [e], (s) => {
      s = s[0];
      var c = `constructor ${s.name}`;
      if (s.registeredClass.constructor_body === void 0 && (s.registeredClass.constructor_body = []), s.registeredClass.constructor_body[t - 1] !== void 0)
        throw new ft(`Cannot register multiple constructors with identical number of parameters (${t - 1}) for class '${s.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
      return s.registeredClass.constructor_body[t - 1] = () => {
        xt(`Cannot construct ${s.name} due to unbound types`, u);
      }, J([], u, (d) => (d.splice(1, 0, null), s.registeredClass.constructor_body[t - 1] = Gt(c, d, null, a, i), [])), [];
    });
  }, ge = (e) => {
    e = e.trim();
    const t = e.indexOf("(");
    return t === -1 ? e : e.slice(0, t);
  }, qr = (e, t, r, n, a, i, u, s, c, d) => {
    var p = zt(r, n);
    t = F(t), t = ge(t), i = W(a, i), J([], [e], (v) => {
      v = v[0];
      var $ = `${v.name}.${t}`;
      t.startsWith("@@") && (t = Symbol[t.substring(2)]), s && v.registeredClass.pureVirtualFunctions.push(t);
      function b() {
        xt(`Cannot call ${$} due to unbound types`, p);
      }
      var E = v.registeredClass.instancePrototype, S = E[t];
      return S === void 0 || S.overloadTable === void 0 && S.className !== v.name && S.argCount === r - 2 ? (b.argCount = r - 2, b.className = v.name, E[t] = b) : (fe(E, t, $), E[t].overloadTable[r - 2] = b), J([], p, (A) => {
        var D = Gt($, A, v, i, u);
        return E[t].overloadTable === void 0 ? (D.argCount = r - 2, E[t] = D) : E[t].overloadTable[r - 2] = D, [];
      }), [];
    });
  }, we = [], K = [0, 1, , 1, null, 1, !0, 1, !1, 1], Xt = (e) => {
    e > 9 && --K[e + 1] === 0 && (K[e] = void 0, we.push(e));
  }, H = {
    toValue: (e) => (e || T(`Cannot use deleted val. handle = ${e}`), K[e]),
    toHandle: (e) => {
      switch (e) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const t = we.pop() || K.length;
          return K[t] = e, K[t + 1] = 1, t;
        }
      }
    }
  }, $e = {
    name: "emscripten::val",
    fromWireType: (e) => {
      var t = H.toValue(e);
      return Xt(e), t;
    },
    toWireType: (e, t) => H.toHandle(t),
    argPackAdvance: k,
    readValueFromPointer: lt,
    destructorFunction: null
  }, Yr = (e) => U(e, $e), Zr = (e, t) => {
    switch (t) {
      case 4:
        return function(r) {
          return this.fromWireType(ee[r >> 2]);
        };
      case 8:
        return function(r) {
          return this.fromWireType(re[r >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${t}): ${e}`);
    }
  }, Qr = (e, t, r) => {
    t = F(t), U(e, {
      name: t,
      fromWireType: (n) => n,
      toWireType: (n, a) => a,
      argPackAdvance: k,
      readValueFromPointer: Zr(t, r),
      destructorFunction: null
    });
  }, Jr = (e, t, r, n, a, i, u, s) => {
    var c = zt(t, r);
    e = F(e), e = ge(e), a = W(n, a), de(e, function() {
      xt(`Cannot call ${e} due to unbound types`, c);
    }, t - 1), J([], c, (d) => {
      var p = [d[0], null].concat(d.slice(1));
      return pe(e, Gt(e, p, null, a, i), t - 1), [];
    });
  }, Kr = (e, t, r) => {
    switch (t) {
      case 1:
        return r ? (n) => Y[n] : (n) => B[n];
      case 2:
        return r ? (n) => mt[n >> 1] : (n) => rt[n >> 1];
      case 4:
        return r ? (n) => nt[n >> 2] : (n) => P[n >> 2];
      default:
        throw new TypeError(`invalid integer width (${t}): ${e}`);
    }
  }, tn = (e, t, r, n, a) => {
    t = F(t);
    const i = n === 0;
    let u = (c) => c;
    if (i) {
      var s = 32 - 8 * r;
      u = (c) => c << s >>> s, a = u(a);
    }
    U(e, {
      name: t,
      fromWireType: u,
      toWireType: (c, d) => d,
      argPackAdvance: k,
      readValueFromPointer: Kr(t, r, n !== 0),
      destructorFunction: null
    });
  }, en = (e, t, r) => {
    var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array], a = n[t];
    function i(u) {
      var s = P[u >> 2], c = P[u + 4 >> 2];
      return new a(Y.buffer, c, s);
    }
    r = F(r), U(e, {
      name: r,
      fromWireType: i,
      argPackAdvance: k,
      readValueFromPointer: i
    }, {
      ignoreDuplicateRegistrations: !0
    });
  }, rn = Object.assign({
    optional: !0
  }, $e), nn = (e, t) => {
    U(e, rn);
  }, an = (e, t, r, n) => {
    if (!(n > 0)) return 0;
    for (var a = r, i = r + n - 1, u = 0; u < e.length; ++u) {
      var s = e.charCodeAt(u);
      if (s >= 55296 && s <= 57343) {
        var c = e.charCodeAt(++u);
        s = 65536 + ((s & 1023) << 10) | c & 1023;
      }
      if (s <= 127) {
        if (r >= i) break;
        t[r++] = s;
      } else if (s <= 2047) {
        if (r + 1 >= i) break;
        t[r++] = 192 | s >> 6, t[r++] = 128 | s & 63;
      } else if (s <= 65535) {
        if (r + 2 >= i) break;
        t[r++] = 224 | s >> 12, t[r++] = 128 | s >> 6 & 63, t[r++] = 128 | s & 63;
      } else {
        if (r + 3 >= i) break;
        t[r++] = 240 | s >> 18, t[r++] = 128 | s >> 12 & 63, t[r++] = 128 | s >> 6 & 63, t[r++] = 128 | s & 63;
      }
    }
    return t[r] = 0, r - a;
  }, ot = (e, t, r) => an(e, B, t, r), be = (e) => {
    for (var t = 0, r = 0; r < e.length; ++r) {
      var n = e.charCodeAt(r);
      n <= 127 ? t++ : n <= 2047 ? t += 2 : n >= 55296 && n <= 57343 ? (t += 4, ++r) : t += 3;
    }
    return t;
  }, Ce = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Te = function(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : NaN;
    for (var n = t + r, a = t; e[a] && !(a >= n); ) ++a;
    if (a - t > 16 && e.buffer && Ce)
      return Ce.decode(e.subarray(t, a));
    for (var i = ""; t < a; ) {
      var u = e[t++];
      if (!(u & 128)) {
        i += String.fromCharCode(u);
        continue;
      }
      var s = e[t++] & 63;
      if ((u & 224) == 192) {
        i += String.fromCharCode((u & 31) << 6 | s);
        continue;
      }
      var c = e[t++] & 63;
      if ((u & 240) == 224 ? u = (u & 15) << 12 | s << 6 | c : u = (u & 7) << 18 | s << 12 | c << 6 | e[t++] & 63, u < 65536)
        i += String.fromCharCode(u);
      else {
        var d = u - 65536;
        i += String.fromCharCode(55296 | d >> 10, 56320 | d & 1023);
      }
    }
    return i;
  }, on = (e, t) => e ? Te(B, e, t) : "", sn = (e, t) => {
    t = F(t), U(e, {
      name: t,
      fromWireType(r) {
        for (var n = P[r >> 2], a = r + 4, i, s, u = a, s = 0; s <= n; ++s) {
          var c = a + s;
          if (s == n || B[c] == 0) {
            var d = c - u, p = on(u, d);
            i === void 0 ? i = p : (i += "\0", i += p), u = c + 1;
          }
        }
        return tt(r), i;
      },
      toWireType(r, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var a, i = typeof n == "string";
        i || ArrayBuffer.isView(n) && n.BYTES_PER_ELEMENT == 1 || T("Cannot pass non-string to std::string"), i ? a = be(n) : a = n.length;
        var u = Oe(4 + a + 1), s = u + 4;
        return P[u >> 2] = a, i ? ot(n, s, a + 1) : B.set(n, s), r !== null && r.push(tt, u), u;
      },
      argPackAdvance: k,
      readValueFromPointer: lt,
      destructorFunction(r) {
        tt(r);
      }
    });
  }, Pe = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, un = (e, t) => {
    for (var r = e >> 1, n = r + t / 2, a = r; !(a >= n) && rt[a]; ) ++a;
    if (a - r > 16 && Pe) return Pe.decode(rt.subarray(r, a));
    for (var i = "", u = r; !(u >= n); ++u) {
      var s = rt[u];
      if (s == 0) break;
      i += String.fromCharCode(s);
    }
    return i;
  }, cn = (e, t, r) => {
    if (r != null || (r = 2147483647), r < 2) return 0;
    r -= 2;
    for (var n = t, a = r < e.length * 2 ? r / 2 : e.length, i = 0; i < a; ++i) {
      var u = e.charCodeAt(i);
      mt[t >> 1] = u, t += 2;
    }
    return mt[t >> 1] = 0, t - n;
  }, ln = (e) => e.length * 2, fn = (e, t) => {
    for (var r = 0, n = ""; !(r >= t / 4); ) {
      var a = nt[e + r * 4 >> 2];
      if (a == 0) break;
      if (++r, a >= 65536) {
        var i = a - 65536;
        n += String.fromCharCode(55296 | i >> 10, 56320 | i & 1023);
      } else
        n += String.fromCharCode(a);
    }
    return n;
  }, dn = (e, t, r) => {
    if (r != null || (r = 2147483647), r < 4) return 0;
    for (var n = t, a = n + r - 4, i = 0; i < e.length; ++i) {
      var u = e.charCodeAt(i);
      if (u >= 55296 && u <= 57343) {
        var s = e.charCodeAt(++i);
        u = 65536 + ((u & 1023) << 10) | s & 1023;
      }
      if (nt[t >> 2] = u, t += 4, t + 4 > a) break;
    }
    return nt[t >> 2] = 0, t - n;
  }, hn = (e) => {
    for (var t = 0, r = 0; r < e.length; ++r) {
      var n = e.charCodeAt(r);
      n >= 55296 && n <= 57343 && ++r, t += 4;
    }
    return t;
  }, pn = (e, t, r) => {
    r = F(r);
    var n, a, i, u;
    t === 2 ? (n = un, a = cn, u = ln, i = (s) => rt[s >> 1]) : t === 4 && (n = fn, a = dn, u = hn, i = (s) => P[s >> 2]), U(e, {
      name: r,
      fromWireType: (s) => {
        for (var c = P[s >> 2], d, p = s + 4, v = 0; v <= c; ++v) {
          var $ = s + 4 + v * t;
          if (v == c || i($) == 0) {
            var b = $ - p, E = n(p, b);
            d === void 0 ? d = E : (d += "\0", d += E), p = $ + t;
          }
        }
        return tt(s), d;
      },
      toWireType: (s, c) => {
        typeof c != "string" && T(`Cannot pass non-string to C++ string type ${r}`);
        var d = u(c), p = Oe(4 + d + t);
        return P[p >> 2] = d / t, a(c, p + 4, d + t), s !== null && s.push(tt, p), p;
      },
      argPackAdvance: k,
      readValueFromPointer: lt,
      destructorFunction(s) {
        tt(s);
      }
    });
  }, vn = (e, t, r, n, a, i) => {
    Ct[e] = {
      name: F(t),
      rawConstructor: W(r, n),
      rawDestructor: W(a, i),
      fields: []
    };
  }, yn = (e, t, r, n, a, i, u, s, c, d) => {
    Ct[e].fields.push({
      fieldName: F(t),
      getterReturnType: r,
      getter: W(n, a),
      getterContext: i,
      setterArgumentType: u,
      setter: W(s, c),
      setterContext: d
    });
  }, mn = (e, t) => {
    t = F(t), U(e, {
      isVoid: !0,
      name: t,
      argPackAdvance: 0,
      fromWireType: () => {
      },
      toWireType: (r, n) => {
      }
    });
  }, qt = [], gn = (e, t, r, n) => (e = qt[e], t = H.toValue(t), e(null, t, r, n)), wn = {}, $n = (e) => {
    var t = wn[e];
    return t === void 0 ? F(e) : t;
  }, _e = () => {
    if (typeof globalThis == "object")
      return globalThis;
    function e(t) {
      t.$$$embind_global$$$ = t;
      var r = typeof $$$embind_global$$$ == "object" && t.$$$embind_global$$$ == t;
      return r || delete t.$$$embind_global$$$, r;
    }
    if (typeof $$$embind_global$$$ == "object" || (typeof global == "object" && e(global) ? $$$embind_global$$$ = global : typeof self == "object" && e(self) && ($$$embind_global$$$ = self), typeof $$$embind_global$$$ == "object"))
      return $$$embind_global$$$;
    throw Error("unable to get global object.");
  }, bn = (e) => e === 0 ? H.toHandle(_e()) : (e = $n(e), H.toHandle(_e()[e])), Cn = (e) => {
    var t = qt.length;
    return qt.push(e), t;
  }, Ee = (e, t) => {
    var r = Q[e];
    return r === void 0 && T(`${t} has unknown type ${me(e)}`), r;
  }, Tn = (e, t) => {
    for (var r = new Array(e), n = 0; n < e; ++n)
      r[n] = Ee(P[t + n * 4 >> 2], `parameter ${n}`);
    return r;
  }, Pn = (e, t, r) => {
    var n = [], a = e.toWireType(n, r);
    return n.length && (P[t >> 2] = H.toHandle(n)), a;
  }, _n = Reflect.construct, En = (e, t, r) => {
    var n = Tn(e, t), a = n.shift();
    e--;
    var i = new Array(e), u = (c, d, p, v) => {
      for (var $ = 0, b = 0; b < e; ++b)
        i[b] = n[b].readValueFromPointer(v + $), $ += n[b].argPackAdvance;
      var E = r === 1 ? _n(d, i) : d.apply(c, i);
      return Pn(a, p, E);
    }, s = `methodCaller<(${n.map((c) => c.name).join(", ")}) => ${a.name}>`;
    return Cn(kt(s, u));
  }, On = (e) => {
    e > 9 && (K[e + 1] += 1);
  }, xn = (e) => {
    var t = H.toValue(e);
    Wt(t), Xt(e);
  }, An = (e, t) => {
    e = Ee(e, "_emval_take_value");
    var r = e.readValueFromPointer(t);
    return H.toHandle(r);
  }, Sn = (e, t, r, n) => {
    var a = (/* @__PURE__ */ new Date()).getFullYear(), i = new Date(a, 0, 1), u = new Date(a, 6, 1), s = i.getTimezoneOffset(), c = u.getTimezoneOffset(), d = Math.max(s, c);
    P[e >> 2] = d * 60, nt[t >> 2] = +(s != c);
    var p = (b) => {
      var E = b >= 0 ? "-" : "+", S = Math.abs(b), A = String(Math.floor(S / 60)).padStart(2, "0"), D = String(S % 60).padStart(2, "0");
      return `UTC${E}${A}${D}`;
    }, v = p(s), $ = p(c);
    c < s ? (ot(v, r, 17), ot($, n, 17)) : (ot(v, n, 17), ot($, r, 17));
  }, Dn = () => 2147483648, In = (e, t) => Math.ceil(e / t) * t, Mn = (e) => {
    var t = yt.buffer, r = (e - t.byteLength + 65535) / 65536 | 0;
    try {
      return yt.grow(r), ne(), 1;
    } catch {
    }
  }, Fn = (e) => {
    var t = B.length;
    e >>>= 0;
    var r = Dn();
    if (e > r)
      return !1;
    for (var n = 1; n <= 4; n *= 2) {
      var a = t * (1 + 0.2 / n);
      a = Math.min(a, e + 100663296);
      var i = Math.min(r, In(Math.max(e, a), 65536)), u = Mn(i);
      if (u)
        return !0;
    }
    return !1;
  }, Yt = {}, jn = () => z || "./this.program", ht = () => {
    if (!ht.strings) {
      var e = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", t = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: e,
        _: jn()
      };
      for (var r in Yt)
        Yt[r] === void 0 ? delete t[r] : t[r] = Yt[r];
      var n = [];
      for (var r in t)
        n.push(`${r}=${t[r]}`);
      ht.strings = n;
    }
    return ht.strings;
  }, Rn = (e, t) => {
    var r = 0, n = 0;
    for (var a of ht()) {
      var i = t + r;
      P[e + n >> 2] = i, r += ot(a, i, 1 / 0) + 1, n += 4;
    }
    return 0;
  }, Ln = (e, t) => {
    var r = ht();
    P[e >> 2] = r.length;
    var n = 0;
    for (var a of r)
      n += be(a) + 1;
    return P[t >> 2] = n, 0;
  }, Bn = (e) => 52;
  function Wn(e, t, r, n, a) {
    return 70;
  }
  var Un = [null, [], []], Vn = (e, t) => {
    var r = Un[e];
    t === 0 || t === 10 ? ((e === 1 ? vt : G)(Te(r)), r.length = 0) : r.push(t);
  }, kn = (e, t, r, n) => {
    for (var a = 0, i = 0; i < r; i++) {
      var u = P[t >> 2], s = P[t + 4 >> 2];
      t += 8;
      for (var c = 0; c < s; c++)
        Vn(e, B[u + c]);
      a += s;
    }
    return P[n >> 2] = a, 0;
  }, Hn = (e) => e;
  Pr(), Ar(), Vr(), f.noExitRuntime && f.noExitRuntime, f.print && (vt = f.print), f.printErr && (G = f.printErr), f.wasmBinary && (ut = f.wasmBinary), f.arguments && f.arguments, f.thisProgram && (z = f.thisProgram);
  var Nn = {
    s: fr,
    w: dr,
    a: hr,
    j: pr,
    m: vr,
    P: yr,
    p: mr,
    ga: gr,
    d: wr,
    ba: $r,
    ua: Cr,
    aa: Tr,
    pa: Er,
    sa: zr,
    ra: Xr,
    H: qr,
    na: Yr,
    V: Qr,
    W: Jr,
    x: tn,
    t: en,
    ta: nn,
    oa: sn,
    Q: pn,
    I: vn,
    va: yn,
    qa: mn,
    da: gn,
    wa: Xt,
    D: bn,
    ma: En,
    X: On,
    Y: xn,
    U: An,
    ca: Sn,
    ha: Fn,
    ea: Rn,
    fa: Ln,
    ia: Bn,
    _: Wn,
    S: kn,
    K: Pa,
    C: Ea,
    M: na,
    R: Ia,
    q: $a,
    b: ia,
    E: Ta,
    ka: xa,
    c: sa,
    ja: Aa,
    h: ra,
    i: fa,
    r: va,
    O: Ca,
    v: ma,
    F: wa,
    L: ba,
    z: Oa,
    J: Ma,
    $: Fa,
    Z: ja,
    k: ua,
    f: ea,
    e: oa,
    g: aa,
    N: Da,
    l: la,
    la: _a,
    o: ya,
    B: da,
    u: ga,
    T: pa,
    A: Sa,
    n: ca,
    G: ha,
    y: Hn
  }, _ = await ur();
  _.ya;
  var zn = _.za, tt = f._free = _.Aa, Oe = f._malloc = _.Ca, Gn = _.Da, y = _.Ea, Xn = _.Fa, qn = _.Ga, Yn = _.Ha, Zn = _.Ia, Qn = _.Ja, Jn = _.Ka;
  f.dynCall_viijii = _.La;
  var Kn = f.dynCall_iiijj = _.Ma;
  f.dynCall_jiji = _.Na;
  var ta = f.dynCall_jiiii = _.Oa;
  f.dynCall_iiiiij = _.Pa, f.dynCall_iiiiijj = _.Qa, f.dynCall_iiiiiijj = _.Ra;
  function ea(e, t) {
    var r = g();
    try {
      w(e)(t);
    } catch (n) {
      if (m(r), n !== n + 0) throw n;
      y(1, 0);
    }
  }
  function ra(e, t, r, n) {
    var a = g();
    try {
      return w(e)(t, r, n);
    } catch (i) {
      if (m(a), i !== i + 0) throw i;
      y(1, 0);
    }
  }
  function na(e, t, r, n, a) {
    var i = g();
    try {
      return w(e)(t, r, n, a);
    } catch (u) {
      if (m(i), u !== u + 0) throw u;
      y(1, 0);
    }
  }
  function aa(e, t, r, n) {
    var a = g();
    try {
      w(e)(t, r, n);
    } catch (i) {
      if (m(a), i !== i + 0) throw i;
      y(1, 0);
    }
  }
  function oa(e, t, r) {
    var n = g();
    try {
      w(e)(t, r);
    } catch (a) {
      if (m(n), a !== a + 0) throw a;
      y(1, 0);
    }
  }
  function ia(e, t) {
    var r = g();
    try {
      return w(e)(t);
    } catch (n) {
      if (m(r), n !== n + 0) throw n;
      y(1, 0);
    }
  }
  function sa(e, t, r) {
    var n = g();
    try {
      return w(e)(t, r);
    } catch (a) {
      if (m(n), a !== a + 0) throw a;
      y(1, 0);
    }
  }
  function ua(e) {
    var t = g();
    try {
      w(e)();
    } catch (r) {
      if (m(t), r !== r + 0) throw r;
      y(1, 0);
    }
  }
  function ca(e, t, r, n, a, i, u, s, c, d, p) {
    var v = g();
    try {
      w(e)(t, r, n, a, i, u, s, c, d, p);
    } catch ($) {
      if (m(v), $ !== $ + 0) throw $;
      y(1, 0);
    }
  }
  function la(e, t, r, n, a) {
    var i = g();
    try {
      w(e)(t, r, n, a);
    } catch (u) {
      if (m(i), u !== u + 0) throw u;
      y(1, 0);
    }
  }
  function fa(e, t, r, n, a) {
    var i = g();
    try {
      return w(e)(t, r, n, a);
    } catch (u) {
      if (m(i), u !== u + 0) throw u;
      y(1, 0);
    }
  }
  function da(e, t, r, n, a, i, u) {
    var s = g();
    try {
      w(e)(t, r, n, a, i, u);
    } catch (c) {
      if (m(s), c !== c + 0) throw c;
      y(1, 0);
    }
  }
  function ha(e, t, r, n, a, i, u, s, c, d, p, v, $, b, E, S) {
    var A = g();
    try {
      w(e)(t, r, n, a, i, u, s, c, d, p, v, $, b, E, S);
    } catch (D) {
      if (m(A), D !== D + 0) throw D;
      y(1, 0);
    }
  }
  function pa(e, t, r, n, a, i, u, s, c) {
    var d = g();
    try {
      w(e)(t, r, n, a, i, u, s, c);
    } catch (p) {
      if (m(d), p !== p + 0) throw p;
      y(1, 0);
    }
  }
  function va(e, t, r, n, a, i) {
    var u = g();
    try {
      return w(e)(t, r, n, a, i);
    } catch (s) {
      if (m(u), s !== s + 0) throw s;
      y(1, 0);
    }
  }
  function ya(e, t, r, n, a, i) {
    var u = g();
    try {
      w(e)(t, r, n, a, i);
    } catch (s) {
      if (m(u), s !== s + 0) throw s;
      y(1, 0);
    }
  }
  function ma(e, t, r, n, a, i, u) {
    var s = g();
    try {
      return w(e)(t, r, n, a, i, u);
    } catch (c) {
      if (m(s), c !== c + 0) throw c;
      y(1, 0);
    }
  }
  function ga(e, t, r, n, a, i, u, s) {
    var c = g();
    try {
      w(e)(t, r, n, a, i, u, s);
    } catch (d) {
      if (m(c), d !== d + 0) throw d;
      y(1, 0);
    }
  }
  function wa(e, t, r, n, a, i, u, s) {
    var c = g();
    try {
      return w(e)(t, r, n, a, i, u, s);
    } catch (d) {
      if (m(c), d !== d + 0) throw d;
      y(1, 0);
    }
  }
  function $a(e) {
    var t = g();
    try {
      return w(e)();
    } catch (r) {
      if (m(t), r !== r + 0) throw r;
      y(1, 0);
    }
  }
  function ba(e, t, r, n, a, i, u, s, c) {
    var d = g();
    try {
      return w(e)(t, r, n, a, i, u, s, c);
    } catch (p) {
      if (m(d), p !== p + 0) throw p;
      y(1, 0);
    }
  }
  function Ca(e, t, r, n, a, i, u) {
    var s = g();
    try {
      return w(e)(t, r, n, a, i, u);
    } catch (c) {
      if (m(s), c !== c + 0) throw c;
      y(1, 0);
    }
  }
  function Ta(e, t, r, n) {
    var a = g();
    try {
      return w(e)(t, r, n);
    } catch (i) {
      if (m(a), i !== i + 0) throw i;
      y(1, 0);
    }
  }
  function Pa(e, t, r, n) {
    var a = g();
    try {
      return w(e)(t, r, n);
    } catch (i) {
      if (m(a), i !== i + 0) throw i;
      y(1, 0);
    }
  }
  function _a(e, t, r, n, a, i, u, s) {
    var c = g();
    try {
      w(e)(t, r, n, a, i, u, s);
    } catch (d) {
      if (m(c), d !== d + 0) throw d;
      y(1, 0);
    }
  }
  function Ea(e, t, r, n, a, i) {
    var u = g();
    try {
      return w(e)(t, r, n, a, i);
    } catch (s) {
      if (m(u), s !== s + 0) throw s;
      y(1, 0);
    }
  }
  function Oa(e, t, r, n, a, i, u, s, c, d) {
    var p = g();
    try {
      return w(e)(t, r, n, a, i, u, s, c, d);
    } catch (v) {
      if (m(p), v !== v + 0) throw v;
      y(1, 0);
    }
  }
  function xa(e, t, r) {
    var n = g();
    try {
      return w(e)(t, r);
    } catch (a) {
      if (m(n), a !== a + 0) throw a;
      y(1, 0);
    }
  }
  function Aa(e, t, r, n, a) {
    var i = g();
    try {
      return w(e)(t, r, n, a);
    } catch (u) {
      if (m(i), u !== u + 0) throw u;
      y(1, 0);
    }
  }
  function Sa(e, t, r, n, a, i, u, s, c, d) {
    var p = g();
    try {
      w(e)(t, r, n, a, i, u, s, c, d);
    } catch (v) {
      if (m(p), v !== v + 0) throw v;
      y(1, 0);
    }
  }
  function Da(e, t, r, n, a, i, u) {
    var s = g();
    try {
      w(e)(t, r, n, a, i, u);
    } catch (c) {
      if (m(s), c !== c + 0) throw c;
      y(1, 0);
    }
  }
  function Ia(e, t, r, n) {
    var a = g();
    try {
      return w(e)(t, r, n);
    } catch (i) {
      if (m(a), i !== i + 0) throw i;
      y(1, 0);
    }
  }
  function Ma(e, t, r, n, a, i, u, s, c, d, p, v) {
    var $ = g();
    try {
      return w(e)(t, r, n, a, i, u, s, c, d, p, v);
    } catch (b) {
      if (m($), b !== b + 0) throw b;
      y(1, 0);
    }
  }
  function Fa(e, t, r, n, a, i, u) {
    var s = g();
    try {
      return Kn(e, t, r, n, a, i, u);
    } catch (c) {
      if (m(s), c !== c + 0) throw c;
      y(1, 0);
    }
  }
  function ja(e, t, r, n, a) {
    var i = g();
    try {
      return ta(e, t, r, n, a);
    } catch (u) {
      if (m(i), u !== u + 0) throw u;
      y(1, 0);
    }
  }
  function Zt() {
    if (Z > 0) {
      ct = Zt;
      return;
    }
    if (Qe(), Z > 0) {
      ct = Zt;
      return;
    }
    function e() {
      var t;
      f.calledRun = !0, !te && (Je(), C(f), (t = f.onRuntimeInitialized) === null || t === void 0 || t.call(f), Ke());
    }
    f.setStatus ? (f.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => f.setStatus(""), 1), e();
    }, 1)) : e();
  }
  function Ra() {
    if (f.preInit)
      for (typeof f.preInit == "function" && (f.preInit = [f.preInit]); f.preInit.length > 0; )
        f.preInit.shift()();
  }
  return Ra(), Zt(), l = I, l;
};
function Ve(o) {
  return Ue(Kt, o);
}
function To() {
  return to(Kt);
}
function Po(o) {
  Ve({
    overrides: o,
    equalityFn: Object.is,
    fireImmediately: !1
  });
}
async function ro(o, l) {
  return eo(Kt, o, l);
}
const _o = "1c961d9d9a1f0001f5d00486bcf8e1b1a91fcf9fe17ebcbd6e2b6efe21e23038", ke = [
  ["aztec", "Aztec"],
  ["code_128", "Code128"],
  ["code_39", "Code39"],
  ["code_93", "Code93"],
  ["codabar", "Codabar"],
  ["databar", "DataBar"],
  ["databar_expanded", "DataBarExpanded"],
  ["databar_limited", "DataBarLimited"],
  ["data_matrix", "DataMatrix"],
  ["dx_film_edge", "DXFilmEdge"],
  ["ean_13", "EAN-13"],
  ["ean_8", "EAN-8"],
  ["itf", "ITF"],
  ["maxi_code", "MaxiCode"],
  ["micro_qr_code", "MicroQRCode"],
  ["pdf417", "PDF417"],
  ["qr_code", "QRCode"],
  ["rm_qr_code", "rMQRCode"],
  ["upc_a", "UPC-A"],
  ["upc_e", "UPC-E"],
  ["linear_codes", "Linear-Codes"],
  ["matrix_codes", "Matrix-Codes"],
  ["any", "Any"]
], no = [...ke, ["unknown"]].map((o) => o[0]), Jt = new Map(
  ke
);
function ao(o) {
  for (const [l, h] of Jt)
    if (o === h)
      return l;
  return "unknown";
}
function oo(o) {
  if (He(o))
    return {
      width: o.naturalWidth,
      height: o.naturalHeight
    };
  if (Ne(o))
    return {
      width: o.width.baseVal.value,
      height: o.height.baseVal.value
    };
  if (ze(o))
    return {
      width: o.videoWidth,
      height: o.videoHeight
    };
  if (Xe(o))
    return {
      width: o.width,
      height: o.height
    };
  if (Ye(o))
    return {
      width: o.displayWidth,
      height: o.displayHeight
    };
  if (Ge(o))
    return {
      width: o.width,
      height: o.height
    };
  if (qe(o))
    return {
      width: o.width,
      height: o.height
    };
  throw new TypeError(
    "The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'."
  );
}
function He(o) {
  var l, h;
  try {
    return o instanceof ((h = (l = o == null ? void 0 : o.ownerDocument) == null ? void 0 : l.defaultView) == null ? void 0 : h.HTMLImageElement);
  } catch {
    return !1;
  }
}
function Ne(o) {
  var l, h;
  try {
    return o instanceof ((h = (l = o == null ? void 0 : o.ownerDocument) == null ? void 0 : l.defaultView) == null ? void 0 : h.SVGImageElement);
  } catch {
    return !1;
  }
}
function ze(o) {
  var l, h;
  try {
    return o instanceof ((h = (l = o == null ? void 0 : o.ownerDocument) == null ? void 0 : l.defaultView) == null ? void 0 : h.HTMLVideoElement);
  } catch {
    return !1;
  }
}
function Ge(o) {
  var l, h;
  try {
    return o instanceof ((h = (l = o == null ? void 0 : o.ownerDocument) == null ? void 0 : l.defaultView) == null ? void 0 : h.HTMLCanvasElement);
  } catch {
    return !1;
  }
}
function Xe(o) {
  try {
    return o instanceof ImageBitmap || Object.prototype.toString.call(o) === "[object ImageBitmap]";
  } catch {
    return !1;
  }
}
function qe(o) {
  try {
    return o instanceof OffscreenCanvas || Object.prototype.toString.call(o) === "[object OffscreenCanvas]";
  } catch {
    return !1;
  }
}
function Ye(o) {
  try {
    return o instanceof VideoFrame || Object.prototype.toString.call(o) === "[object VideoFrame]";
  } catch {
    return !1;
  }
}
function io(o) {
  try {
    return o instanceof Blob || Object.prototype.toString.call(o) === "[object Blob]";
  } catch {
    return !1;
  }
}
function so(o) {
  try {
    return o instanceof ImageData || Object.prototype.toString.call(o) === "[object ImageData]";
  } catch {
    return !1;
  }
}
function uo(o, l) {
  try {
    const h = new OffscreenCanvas(o, l);
    if (h.getContext("2d") instanceof OffscreenCanvasRenderingContext2D)
      return h;
    throw void 0;
  } catch {
    const h = document.createElement("canvas");
    return h.width = o, h.height = l, h;
  }
}
async function Ze(o) {
  if (He(o) && !await ho(o))
    throw new DOMException(
      "Failed to load or decode HTMLImageElement.",
      "InvalidStateError"
    );
  if (Ne(o) && !await po(o))
    throw new DOMException(
      "Failed to load or decode SVGImageElement.",
      "InvalidStateError"
    );
  if (Ye(o) && vo(o))
    throw new DOMException("VideoFrame is closed.", "InvalidStateError");
  if (ze(o) && (o.readyState === 0 || o.readyState === 1))
    throw new DOMException("Invalid element or state.", "InvalidStateError");
  if (Xe(o) && mo(o))
    throw new DOMException(
      "The image source is detached.",
      "InvalidStateError"
    );
  const { width: l, height: h } = oo(o);
  if (l === 0 || h === 0)
    return null;
  const C = uo(l, h).getContext("2d");
  C.drawImage(o, 0, 0);
  try {
    return C.getImageData(0, 0, l, h);
  } catch {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}
async function co(o) {
  let l;
  try {
    l = await createImageBitmap(o);
  } catch {
    try {
      if (globalThis.Image) {
        l = new Image();
        let C = "";
        try {
          C = URL.createObjectURL(o), l.src = C, await l.decode();
        } finally {
          URL.revokeObjectURL(C);
        }
      } else
        return o;
    } catch {
      throw new DOMException(
        "Failed to load or decode Blob.",
        "InvalidStateError"
      );
    }
  }
  return await Ze(l);
}
function lo(o) {
  const { width: l, height: h } = o;
  if (l === 0 || h === 0)
    return null;
  const f = o.getContext("2d");
  try {
    return f.getImageData(0, 0, l, h);
  } catch {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}
async function fo(o) {
  if (io(o))
    return await co(o);
  if (so(o)) {
    if (yo(o))
      throw new DOMException(
        "The image data has been detached.",
        "InvalidStateError"
      );
    return o;
  }
  return Ge(o) || qe(o) ? lo(o) : await Ze(o);
}
async function ho(o) {
  try {
    return await o.decode(), !0;
  } catch {
    return !1;
  }
}
async function po(o) {
  var l;
  try {
    return await ((l = o.decode) == null ? void 0 : l.call(o)), !0;
  } catch {
    return !1;
  }
}
function vo(o) {
  return o.format === null;
}
function yo(o) {
  return o.data.buffer.byteLength === 0;
}
function mo(o) {
  return o.width === 0 && o.height === 0;
}
function We(o, l) {
  return go(o) ? new DOMException(`${l}: ${o.message}`, o.name) : wo(o) ? new o.constructor(`${l}: ${o.message}`) : new Error(`${l}: ${o}`);
}
function go(o) {
  return o instanceof DOMException || Object.prototype.toString.call(o) === "[object DOMException]";
}
function wo(o) {
  return o instanceof Error || Object.prototype.toString.call(o) === "[object Error]";
}
var pt;
class Eo {
  constructor(l = {}) {
    je(this, pt);
    var h;
    try {
      const f = (h = l == null ? void 0 : l.formats) == null ? void 0 : h.filter(
        (C) => C !== "unknown"
      );
      if ((f == null ? void 0 : f.length) === 0)
        throw new TypeError("Hint option provided, but is empty.");
      for (const C of f != null ? f : [])
        if (!Jt.has(C))
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${C}' is not a valid enum value of type BarcodeFormat.`
          );
      Re(this, pt, f != null ? f : []), Ve({ fireImmediately: !0 }).catch(() => {
      });
    } catch (f) {
      throw We(
        f,
        "Failed to construct 'BarcodeDetector'"
      );
    }
  }
  static async getSupportedFormats() {
    return no.filter((l) => l !== "unknown");
  }
  async detect(l) {
    try {
      const h = await fo(l);
      if (h === null)
        return [];
      let f;
      const C = {
        tryCode39ExtendedMode: !1,
        textMode: "Plain",
        formats: Fe(this, pt).map((O) => Jt.get(O))
      };
      try {
        f = await ro(h, C);
      } catch (O) {
        throw console.error(O), new DOMException(
          "Barcode detection service unavailable.",
          "NotSupportedError"
        );
      }
      return f.map((O) => {
        const {
          topLeft: { x: I, y: j },
          topRight: { x, y: M },
          bottomLeft: { x: z, y: X },
          bottomRight: { x: q, y: it }
        } = O.position, st = Math.min(I, x, z, q), et = Math.min(j, M, X, it), vt = Math.max(I, x, z, q), G = Math.max(j, M, X, it);
        return {
          boundingBox: new DOMRectReadOnly(
            st,
            et,
            vt - st,
            G - et
          ),
          rawValue: O.text,
          format: ao(O.format),
          cornerPoints: [
            {
              x: I,
              y: j
            },
            {
              x,
              y: M
            },
            {
              x: q,
              y: it
            },
            {
              x: z,
              y: X
            }
          ]
        };
      });
    } catch (h) {
      throw We(
        h,
        "Failed to execute 'detect' on 'BarcodeDetector'"
      );
    }
  }
}
pt = new WeakMap();
export {
  Eo as BarcodeDetector,
  Co as ZXING_CPP_COMMIT,
  _o as ZXING_WASM_SHA256,
  bo as ZXING_WASM_VERSION,
  Ve as prepareZXingModule,
  To as purgeZXingModule,
  Po as setZXingModuleOverrides
};
