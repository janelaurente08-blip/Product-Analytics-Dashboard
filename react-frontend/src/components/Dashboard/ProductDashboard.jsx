
import React, { useEffect, useMemo, useState } from 'react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Package,
  Wallet,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

import { getProductQueries } from '../../api/product';

import './ProductDashboard.css';

// ==========================================
// COLORS AND FORMATTERS
// ==========================================

const COLORS = [
  '#2563eb',
  '#0f766e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

const toNumber = (value) => Number(value) || 0;

const formatNumber = (value) =>
  toNumber(value).toLocaleString('en-US');

const formatMoney = (value) =>
  toNumber(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

function ChartCard({ title, description, children }) {
  return (
    <div className="dashboard-chart-card">
      <h3>{title}</h3>
      <p>{description}</p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GridLines() {
  return (
    <CartesianGrid
      strokeDasharray="3 3"
      vertical={false}
      stroke="#e2e8f0"
    />
  );
}

function CategoryXAxis() {
  return (
    <XAxis
      dataKey="name"
      tick={{ fontSize: 10 }}
      interval={0}
    />
  );
}

function NumberYAxis() {
  return (
    <YAxis
      tick={{ fontSize: 11 }}
      width={55}
    />
  );
}

function PriceTooltip() {
  return (
    <Tooltip
      formatter={(value) => formatMoney(value)}
    />
  );
}

function PieColors({ items }) {
  return items.map((item, index) => (
    <Cell
      key={`${item.name}-${index}`}
      fill={COLORS[index % COLORS.length]}
    />
  ));
}

// ==========================================
// PREPARE DATA FROM LARAVEL API
// ==========================================

function prepareDashboardData(data) {
  const products = data.products_with_category || [];
  const electronics = data.electronics || [];
  const firstFive = data.first_five_products || [];

  // GRAPH 1: TOTAL PRICE PER CATEGORY

  const totalByCategory = (
    data.total_price_per_category || []
  ).map((item) => ({
    name: item.name,
    total: toNumber(item.total_price),
  }));

  // GRAPH 2: AVERAGE PRICE PER CATEGORY

  const averageByCategory = (
    data.average_price_per_category || []
  ).map((item) => ({
    name: item.name,
    average: toNumber(item.avg_price),
  }));

  // GRAPH 3: LOWEST PRICE PER CATEGORY

  const lowestByCategory = (
    data.lowest_price_per_category || []
  ).map((item) => ({
    name: item.name,
    lowest: toNumber(item.min_price),
  }));

  // GRAPH 4: PRODUCT COUNT PER CATEGORY

  const categoryCounts = {};

  products.forEach((product) => {
    const name =
      product.category?.name || 'Uncategorized';

    categoryCounts[name] =
      (categoryCounts[name] || 0) + 1;
  });

  const countByCategory = Object.entries(
    categoryCounts
  ).map(([name, value]) => ({
    name,
    value,
  }));

  // GRAPH 5: SORTED AVERAGE PRICE

  const sortedAverage = (
    data.average_price_sorted || []
  ).map((item) => ({
    name: item.name,
    average: toNumber(item.avg_price),
  }));

  // GRAPH 6: ELECTRONICS VS BOOKS

  const electronicsAndBooks = (
    data.electronics_and_books || []
  ).map((item) => ({
    name: item.name,
    average: toNumber(item.avg_price),
  }));

  // GRAPH 7: PRICE DISTRIBUTION

  const createPriceBands = () => [
    {
      name: '0-99',
      min: 0,
      max: 100,
      count: 0,
    },
    {
      name: '100-199',
      min: 100,
      max: 200,
      count: 0,
    },
    {
      name: '200-299',
      min: 200,
      max: 300,
      count: 0,
    },
    {
      name: '300-399',
      min: 300,
      max: 400,
      count: 0,
    },
    {
      name: '400+',
      min: 400,
      max: Infinity,
      count: 0,
    },
  ];

  const buildPriceBands = (items) => {
    const bands = createPriceBands();

    items.forEach((product) => {
      const price = toNumber(product.price);

      const band = bands.find(
        (item) =>
          price >= item.min &&
          price < item.max
      );

      if (band) {
        band.count += 1;
      }
    });

    return bands;
  };

  const priceDistribution =
    buildPriceBands(products);

  // GRAPHS 8 AND 9:
  // MOST EXPENSIVE AND CHEAPEST PRODUCTS

  const sortedProducts = [...products].sort(
    (a, b) =>
      toNumber(a.price) - toNumber(b.price)
  );

  const cheapestProducts = sortedProducts
    .slice(0, 10)
    .map((product) => ({
      name: `${product.name} #${product.id}`,
      price: toNumber(product.price),
    }));

  const expensiveProducts = [...sortedProducts]
    .reverse()
    .slice(0, 10)
    .map((product) => ({
      name: `${product.name} #${product.id}`,
      price: toNumber(product.price),
    }));

  // GRAPH 10: FIRST FIVE PRODUCTS

  const firstFivePrices = firstFive.map(
    (product) => ({
      name: `Product #${product.id}`,
      price: toNumber(product.price),
    })
  );

  // GRAPH 11: ELECTRONICS PRICE DISTRIBUTION

  const electronicsDistribution =
    buildPriceBands(electronics);

  return {
    products,
    totalByCategory,
    averageByCategory,
    lowestByCategory,
    countByCategory,
    sortedAverage,
    electronicsAndBooks,
    priceDistribution,
    cheapestProducts,
    expensiveProducts,
    firstFivePrices,
    electronicsDistribution,
  };
}

// ==========================================
// MAIN PRODUCT DASHBOARD
// ==========================================

export default function ProductDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // LOAD DATA FROM LARAVEL API

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await getProductQueries();

        if (active) {
          setData(result);
        }
      } catch (err) {
        console.error(
          'Dashboard API Error:',
          err
        );

        if (active) {
          setError(
            'Unable to load product data. Please check your Laravel server and API connection.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const charts = useMemo(() => {
    if (!data) {
      return null;
    }

    return prepareDashboardData(data);
  }, [data]);

  const refreshDashboard = () => {
    setRefreshKey(
      (previous) => previous + 1
    );
  };

  // LOADING SCREEN

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading product analytics...
      </div>
    );
  }

  // ERROR SCREEN

  if (error) {
    return (
      <div className="dashboard-message">
        <p>{error}</p>

        <button onClick={refreshDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  if (!data || !charts) {
    return null;
  }

  // ==========================================
  // FOUR SUMMARY CARDS
  // ==========================================

  const stats = [
    {
      title: 'Total Products',
      value: formatNumber(
        charts.products.length
      ),
      icon: Package,
    },
    {
      title: 'Total Price',
      value: formatMoney(data.total_price),
      icon: Wallet,
    },
    {
      title: 'Average Price',
      value: formatMoney(
        data.average_price
      ),
      icon: BarChart3,
    },
    {
      title: 'Highest Price',
      value: formatMoney(
        data.highest_price
      ),
      icon: TrendingUp,
    },
  ];

  // ==========================================
  // DASHBOARD INTERFACE
  // ==========================================

  return (
    <div className="product-dashboard">

      {/* DASHBOARD HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>
            Product Analytics Dashboard
          </h1>

          <p>
            4 summary cards and 11 graphs using Laravel Eloquent query data
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={refreshDashboard}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* ==================================== */}
      {/* FOUR SUMMARY CARDS */}
      {/* ==================================== */}

      <div className="dashboard-stats">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={stat.title}
            >
              <div className="stat-top">
                <span>
                  {stat.title}
                </span>

                <div className="stat-icon">
                  <Icon size={19} />
                </div>
              </div>

              <h2>
                {stat.value}
              </h2>

              <p>
                Based on product API data
              </p>
            </div>
          );
        })}

      </div>

      {/* ==================================== */}
      {/* 11 CHARTS AND GRAPHS */}
      {/* ==================================== */}

      <div className="dashboard-charts">

        {/* GRAPH 1 */}

        <ChartCard
          title="1. Total Price by Category"
          description="Total product prices grouped by category"
        >
          <BarChart data={charts.totalByCategory}>
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <PriceTooltip />

            <Bar
              dataKey="total"
              name="Total Price"
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 2 */}

        <ChartCard
          title="2. Average Price by Category"
          description="Average product price for each category"
        >
          <LineChart data={charts.averageByCategory}>
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <PriceTooltip />

            <Line
              type="monotone"
              dataKey="average"
              name="Average Price"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartCard>

        {/* GRAPH 3 */}

        <ChartCard
          title="3. Lowest Price by Category"
          description="Minimum recorded product price"
        >
          <BarChart
            data={charts.lowestByCategory}
            layout="vertical"
            margin={{
              left: 10,
              right: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis type="number" />

            <YAxis
              type="category"
              dataKey="name"
              width={85}
              tick={{ fontSize: 11 }}
            />

            <PriceTooltip />

            <Bar
              dataKey="lowest"
              name="Lowest Price"
              fill="#3b82f6"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 4 */}

        <ChartCard
          title="4. Products by Category"
          description="Distribution of products across categories"
        >
          <PieChart>
            <Pie
              data={charts.countByCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="42%"
              outerRadius={78}
              label
            >
              <PieColors
                items={charts.countByCategory}
              />
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        {/* GRAPH 5 */}

        <ChartCard
          title="5. Average Price Sorted"
          description="Categories sorted by average product price"
        >
          <AreaChart data={charts.sortedAverage}>
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <PriceTooltip />

            <Area
              type="monotone"
              dataKey="average"
              name="Average Price"
              stroke="#8b5cf6"
              fill="#ddd6fe"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartCard>

        {/* GRAPH 6 */}

        <ChartCard
          title="6. Electronics vs Books"
          description="Average price comparison of Electronics and Books"
        >
          <BarChart
            data={charts.electronicsAndBooks}
          >
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <PriceTooltip />

            <Bar
              dataKey="average"
              name="Average Price"
              fill="#0f766e"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 7 */}

        <ChartCard
          title="7. Product Price Distribution"
          description="Number of products within each price range"
        >
          <BarChart
            data={charts.priceDistribution}
          >
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <Tooltip />

            <Bar
              dataKey="count"
              name="Product Count"
              fill="#0891b2"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 8 */}

        <ChartCard
          title="8. Top 10 Most Expensive Products"
          description="Products with the highest prices"
        >
          <BarChart
            data={charts.expensiveProducts}
            layout="vertical"
            margin={{
              left: 15,
              right: 15,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis type="number" />

            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 9 }}
            />

            <PriceTooltip />

            <Bar
              dataKey="price"
              name="Price"
              fill="#f59e0b"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 9 */}

        <ChartCard
          title="9. Top 10 Cheapest Products"
          description="Products with the lowest prices"
        >
          <BarChart
            data={charts.cheapestProducts}
            layout="vertical"
            margin={{
              left: 15,
              right: 15,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis type="number" />

            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 9 }}
            />

            <PriceTooltip />

            <Bar
              dataKey="price"
              name="Price"
              fill="#0f766e"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 10 */}

        <ChartCard
          title="10. First Five Product Prices"
          description="Prices of the first five products"
        >
          <BarChart
            data={charts.firstFivePrices}
          >
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <PriceTooltip />

            <Bar
              dataKey="price"
              name="Price"
              fill="#8b5cf6"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartCard>

        {/* GRAPH 11 */}

        <ChartCard
          title="11. Electronics Price Distribution"
          description="Electronics products grouped by price range"
        >
          <BarChart
            data={charts.electronicsDistribution}
          >
            <GridLines />
            <CategoryXAxis />
            <NumberYAxis />
            <Tooltip />

            <Bar
              dataKey="count"
              name="Electronics Count"
              fill="#ec4899"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartCard>

      </div>

    </div>
  );
}
