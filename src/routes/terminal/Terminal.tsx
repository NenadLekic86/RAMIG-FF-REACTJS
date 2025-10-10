export default function Terminal() {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),360px]">
        <section className="space-y-4">
          <div className="h-[360px] rounded-md border border-neutral-800 bg-neutral-900">Chart</div>
          <div className="rounded-md border border-neutral-800 bg-neutral-900">Order Book / Trades</div>
          <div className="rounded-md border border-neutral-800 bg-neutral-900">Positions / Orders</div>
        </section>
        <section className="rounded-md border border-neutral-800 bg-neutral-900">Trade Ticket</section>
      </div>
    );
  }