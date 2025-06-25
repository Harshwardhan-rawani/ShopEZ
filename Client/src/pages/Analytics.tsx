/**
 * 分析页面组件 - 提供业务增长洞察和数据分析
 */
import { useState } from 'react'
import { useApp } from '../App'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Eye, Calendar } from 'lucide-react'

export default function Analytics() {
  const { user } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // 模拟分析数据
  const salesData = {
    '7d': { revenue: 1250, orders: 15, customers: 12, growth: 8.5 },
    '30d': { revenue: 5420, orders: 68, customers: 45, growth: 12.3 },
    '90d': { revenue: 16800, orders: 210, customers: 125, growth: 15.7 },
    '1y': { revenue: 68500, orders: 850, customers: 380, growth: 18.2 }
  };

  const currentData = salesData[timeRange];

  const topProducts = [
    { name: 'Elegant Gold Bracelet', sales: 24, revenue: 2159.76, growth: 15.2 },
    { name: 'Silver Necklace', sales: 18, revenue: 1349.82, growth: 8.7 },
    { name: 'Diamond Ring', sales: 12, revenue: 3599.88, growth: 22.1 },
    { name: 'Pearl Earrings', sales: 15, revenue: 1199.85, growth: -2.3 },
    { name: 'Rose Gold Watch', sales: 9, revenue: 1799.91, growth: 31.5 }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 2450, percentage: 35 },
    { source: 'Search Engines', visitors: 1890, percentage: 27 },
    { source: 'Social Media', visitors: 1540, percentage: 22 },
    { source: 'Email Marketing', visitors: 770, percentage: 11 },
    { source: 'Referrals', visitors: 350, percentage: 5 }
  ];

  const customerMetrics = {
    newCustomers: 28,
    returningCustomers: 17,
    averageOrderValue: 79.71,
    customerLifetimeValue: 245.80
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">This page is only accessible to sellers and admins.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${currentData.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+{currentData.growth}%</span>
              <span className="text-sm text-gray-500 ml-2">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.orders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+8.2%</span>
              <span className="text-sm text-gray-500 ml-2">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.customers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
              <span className="text-sm text-gray-500 ml-2">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${customerMetrics.averageOrderValue}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+5.7%</span>
              <span className="text-sm text-gray-500 ml-2">vs previous period</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Top Performing Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                      <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                    <div className="flex items-center">
                      <TrendingUp className={`w-3 h-3 mr-1 ${
                        product.growth > 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        product.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.growth > 0 ? '+' : ''}{product.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Traffic Sources</h2>
            <div className="space-y-4">
              {trafficSources.map(source => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12">
                      {source.percentage}%
                    </span>
                    <span className="text-sm text-gray-500 w-16">
                      {source.visitors.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Customer Insights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{customerMetrics.newCustomers}</div>
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="text-xs text-gray-500 mt-1">This period</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">{customerMetrics.returningCustomers}</div>
              <p className="text-sm font-medium text-gray-600">Returning Customers</p>
              <p className="text-xs text-gray-500 mt-1">This period</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">${customerMetrics.averageOrderValue}</div>
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-xs text-gray-500 mt-1">Per transaction</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">${customerMetrics.customerLifetimeValue}</div>
              <p className="text-sm font-medium text-gray-600">Customer LTV</p>
              <p className="text-xs text-gray-500 mt-1">Average lifetime</p>
            </div>
          </div>
        </div>

        {/* Sales Forecast */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Sales Forecast & Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-green-600">Growth Opportunities</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Increase Social Media Marketing</p>
                    <p className="text-sm text-gray-600">22% of traffic from social media shows strong engagement</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Focus on Diamond Jewelry</p>
                    <p className="text-sm text-gray-600">Highest growth rate at 22.1% and premium pricing</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Customer Retention Programs</p>
                    <p className="text-sm text-gray-600">38% returning customer rate can be improved</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-orange-600">Action Items</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Restock Low Inventory Items</p>
                    <p className="text-sm text-gray-600">Silver Necklace and Diamond Ring running low</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Review Pearl Earrings Strategy</p>
                    <p className="text-sm text-gray-600">-2.3% growth needs attention</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Optimize Email Campaigns</p>
                    <p className="text-sm text-gray-600">Only 11% traffic from email - potential for growth</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
