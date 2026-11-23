import { useEffect, useState } from "react";
import Checkout, { type Shipment, type Status } from "./Checkout";

type Page = "home" | "track" | "services" | "checkout";

const steps: { key: Status; label: string; detail: string }[] = [
  { key: "PICKED_UP", label: "Picked up", detail: "Your parcel has been collected" },
  { key: "IN_TRANSIT", label: "In transit", detail: "Moving through the delivery network" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", detail: "Your parcel is with the delivery partner" },
  { key: "DELIVERED", label: "Delivered", detail: "Your parcel reached its destination" },
];

const sampleShipments: Shipment[] = [
  { awb: "SW1001", customer: "Rahul", status: "IN_TRANSIT", paymentMode: "COD" },
  { awb: "SW1002", customer: "Priya", status: "DELIVERED", paymentMode: "PREPAID" },
  { awb: "SW1003", customer: "Amit", status: "PICKED_UP", paymentMode: "COD" },
];

function loadShipments(): Shipment[] {
  try {
    const saved = localStorage.getItem("shiptrack-shipments");
    return saved ? (JSON.parse(saved) as Shipment[]) : sampleShipments;
  } catch {
    return sampleShipments;
  }
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [shipments, setShipments] = useState<Shipment[]>(loadShipments);
  const [awbInput, setAwbInput] = useState("");
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [trackMessage, setTrackMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("shiptrack-shipments", JSON.stringify(shipments));
  }, [shipments]);

  const goTo = (nextPage: Page) => {
    setPage(nextPage);
    setTrackMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const trackShipment = (awb = awbInput, fallback?: Shipment) => {
    const normalized = awb.trim().toUpperCase();
    if (!normalized) {
      setTrackMessage("Enter your tracking number to continue.");
      setActiveShipment(null);
      return;
    }
    const found = shipments.find((shipment) => shipment.awb === normalized) ??
      (fallback?.awb === normalized ? fallback : null);
    setActiveShipment(found);
    setTrackMessage(found ? "" : "We couldn't find that tracking number. Check it and try again.");
    setAwbInput(normalized);
    setPage("track");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = (shipment: Shipment) => {
    setShipments((current) => [shipment, ...current.filter((item) => item.awb !== shipment.awb)]);
  };

  const currentStep = activeShipment
    ? steps.findIndex((step) => step.key === activeShipment.status)
    : -1;

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="brand" onClick={() => goTo("home")} aria-label="ShipTrack home">
          <span className="brand-mark">S</span>
          <span>shiptrack<span className="brand-period">.</span></span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          <button className={page === "home" ? "nav-link active" : "nav-link"} onClick={() => goTo("home")}>Home</button>
          <button className={page === "track" ? "nav-link active" : "nav-link"} onClick={() => goTo("track")}>Track</button>
          <button className={page === "services" ? "nav-link active" : "nav-link"} onClick={() => goTo("services")}>Services</button>
        </nav>

        <button className="header-cta" onClick={() => goTo("checkout")}>
          Get started <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        {page === "home" && (
          <>
            <section className="hero section-wrap">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-dot" /> SHIPPING, MADE SIMPLE</div>
                <h1>Every delivery.<br /><em>One step</em> closer.</h1>
                <p className="hero-description">
                  From pickup to doorstep, keep every parcel moving with a little more clarity and a lot less worry.
                </p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => goTo("track")}>Track a shipment <span>→</span></button>
                  <button className="text-button" onClick={() => goTo("services")}>Explore services <span>↗</span></button>
                </div>
                <div className="hero-note"><span className="note-check">✓</span> Simple tracking. Clear updates. No guesswork.</div>
              </div>

              <div className="hero-art" aria-label="Illustration of a parcel ready for delivery">
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="floating-tag tag-top"><span className="tag-icon">↗</span><span><b>On the move</b><small>Live shipment updates</small></span></div>
                <div className="parcel">
                  <div className="parcel-top" />
                  <div className="parcel-front"><div className="parcel-tape" /><div className="parcel-label"><span /><span /><span /></div></div>
                  <div className="parcel-side" />
                </div>
                <div className="route-line"><span /><span /><span /></div>
                <div className="floating-tag tag-bottom"><span className="delivered-icon">✓</span><span><b>Delivered with care</b><small>Right where it belongs</small></span></div>
                <div className="art-caption">YOUR PARCEL, IN GOOD HANDS</div>
              </div>
            </section>

            <section className="quick-track">
              <div className="quick-track-copy"><span className="mini-label">KNOW WHERE IT IS</span><h2>Your delivery, at a glance.</h2></div>
              <form className="track-form" onSubmit={(event) => { event.preventDefault(); trackShipment(); }}>
                <label className="sr-only" htmlFor="home-awb">Tracking number</label>
                <span className="search-icon">⌕</span>
                <input id="home-awb" value={awbInput} onChange={(event) => setAwbInput(event.target.value)} placeholder="Enter your tracking number" />
                <button className="primary-button" type="submit">Track parcel <span>→</span></button>
              </form>
            </section>

            <section className="benefits section-wrap">
              <div><span className="benefit-number">01</span><b>Know what’s next</b><p>Follow each delivery milestone without the uncertainty.</p></div>
              <div><span className="benefit-number">02</span><b>Keep it simple</b><p>One tracking number gives you the details that matter.</p></div>
              <div><span className="benefit-number">03</span><b>Stay in control</b><p>Clear checkout and shipment information in one place.</p></div>
            </section>
          </>
        )}

        {page === "track" && (
          <section className="inner-page section-wrap">
            <div className="page-heading">
              <div className="eyebrow"><span className="eyebrow-dot" /> SHIPMENT UPDATES</div>
              <h1>Track your <em>parcel.</em></h1>
              <p>Enter the tracking number shared with you to see the latest shipment status.</p>
            </div>
            <form className="track-form track-page-form" onSubmit={(event) => { event.preventDefault(); trackShipment(); }}>
              <label className="sr-only" htmlFor="track-awb">Tracking number</label>
              <span className="search-icon">⌕</span>
              <input id="track-awb" value={awbInput} onChange={(event) => setAwbInput(event.target.value)} placeholder="e.g. SW1001" />
              <button className="primary-button" type="submit">Track parcel <span>→</span></button>
            </form>
            <p className="sample-hint">Demo tracking numbers: <button onClick={() => { setAwbInput("SW1001"); trackShipment("SW1001"); }}>SW1001</button>, <button onClick={() => { setAwbInput("SW1002"); trackShipment("SW1002"); }}>SW1002</button>, <button onClick={() => { setAwbInput("SW1003"); trackShipment("SW1003"); }}>SW1003</button></p>
            {trackMessage && <div className="notice">{trackMessage}</div>}
            {activeShipment && (
              <div className="tracking-result">
                <div className="result-top">
                  <div><span className="mini-label">TRACKING NUMBER</span><h2>{activeShipment.awb}</h2></div>
                  <span className="status-pill">{activeShipment.status.replaceAll("_", " ")}</span>
                </div>
                <div className="result-meta"><span>Recipient <b>{activeShipment.customer}</b></span><span>Payment <b>{activeShipment.paymentMode}</b></span></div>
                <div className="timeline">
                  {steps.map((step, index) => (
                    <div className={`timeline-step ${index <= currentStep ? "complete" : ""}`} key={step.key}>
                      <span className="timeline-marker">{index < currentStep ? "✓" : index === currentStep ? "•" : ""}</span>
                      <div><b>{step.label}</b><p>{step.detail}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {page === "services" && (
          <section className="inner-page section-wrap">
            <div className="page-heading">
              <div className="eyebrow"><span className="eyebrow-dot" /> WHAT WE OFFER</div>
              <h1>Shipping that fits<br /><em>your day.</em></h1>
              <p>Useful delivery essentials, designed to make sending and receiving parcels straightforward.</p>
            </div>
            <div className="service-grid">
              <article className="service-card"><span className="service-icon">↗</span><span className="mini-label">01 / VISIBILITY</span><h2>Shipment tracking</h2><p>Check parcel progress from pickup through delivery with a clear milestone timeline.</p><button onClick={() => goTo("track")}>Track a parcel <span>→</span></button></article>
              <article className="service-card"><span className="service-icon">▣</span><span className="mini-label">02 / CHECKOUT</span><h2>Easy order placement</h2><p>Add delivery details, verify your pincode and review the order total before placing an order.</p><button onClick={() => goTo("checkout")}>Create an order <span>→</span></button></article>
              <article className="service-card"><span className="service-icon">✓</span><span className="mini-label">03 / CONVENIENCE</span><h2>Flexible payment</h2><p>Choose cash on delivery or prepaid at checkout, with charges shown upfront.</p><button onClick={() => goTo("checkout")}>Get started <span>→</span></button></article>
            </div>
          </section>
        )}

        {page === "checkout" && (
          <section className="inner-page section-wrap checkout-page">
            <div className="page-heading">
              <div className="eyebrow"><span className="eyebrow-dot" /> START A DELIVERY</div>
              <h1>Place your <em>order.</em></h1>
              <p>Enter your delivery details below. Your tracking number will be generated after checkout.</p>
            </div>
            <Checkout onPlaceOrder={handlePlaceOrder} onGoTrack={trackShipment} />
          </section>
        )}
      </main>

      <footer className="site-footer">
        <button className="footer-brand" onClick={() => goTo("home")}>shiptrack<span>.</span></button>
        <p>Moving parcels. Making things simpler.</p>
        <div><button onClick={() => goTo("home")}>Home</button><button onClick={() => goTo("track")}>Track</button><button onClick={() => goTo("services")}>Services</button></div>
        <small>© 2026 ShipTrack. Demo website.</small>
      </footer>
    </div>
  );
}

export default App;
