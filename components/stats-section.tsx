export function StatsSection() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Trusted by Leading Entrepreneurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-5xl font-bold text-primary">500+</div>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-primary">$1M+</div>
            <p className="text-gray-600">Revenue Generated</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-primary">98%</div>
            <p className="text-gray-600">Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  )
}

