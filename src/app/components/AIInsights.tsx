'use client';

interface AIInsightsProps {
  insights: {
    marketTrends: string;
    salaryAnalysis: string;
    timestamp: string;
  };
}

export default function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h4 className="card-title">
          <i className="bi bi-robot"></i> AI Market Insights
        </h4>
        <div className="row">
          <div className="col-md-6">
            <h5>Market Trends</h5>
            <p className="text-muted">{insights.marketTrends}</p>
          </div>
          <div className="col-md-6">
            <h5>Salary Analysis</h5>
            <p className="text-muted">{insights.salaryAnalysis}</p>
          </div>
        </div>
        <small className="text-muted">
          Last updated: {new Date(insights.timestamp).toLocaleString()}
        </small>
      </div>
    </div>
  );
}