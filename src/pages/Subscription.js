import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showNotification } from '../components/common/NotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiClient from '../config/api';
import './Subscription.css';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await apiClient.get('/auth/subscription/');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planType) => {
    showNotification(`Upgrading to ${planType} plan...`, 'info');
    // PayPal integration would go here
  };

  if (loading) {
    return <LoadingSpinner message="Loading subscription information..." />;
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Subscription Plans</h1>
        <p>Choose the plan that best fits your needs</p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="current-subscription">
          <h2>Current Plan</h2>
          <div className="subscription-card current">
            <h3>{subscription.plan_type || 'Free'}</h3>
            <p>Status: {subscription.is_active ? 'Active' : 'Inactive'}</p>
            {subscription.expires_at && (
              <p>Expires: {new Date(subscription.expires_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="pricing-plans">
        <div className="plans-grid">
          {/* Free Plan */}
          <div className="plan-card">
            <div className="plan-header">
              <h3>Free</h3>
              <div className="plan-price">
                <span className="price">$0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                <li>✅ 5 projects per month</li>
                <li>✅ Basic file conversion</li>
                <li>✅ Standard support</li>
                <li>❌ Advanced features</li>
                <li>❌ Priority support</li>
              </ul>
            </div>
            <button 
              className="btn btn-secondary"
              disabled={!subscription || subscription.plan_type === 'free'}
            >
              {!subscription || subscription.plan_type === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="plan-card featured">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-header">
              <h3>Pro</h3>
              <div className="plan-price">
                <span className="price">$9.99</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                <li>✅ Unlimited projects</li>
                <li>✅ Advanced file conversion</li>
                <li>✅ Batch processing</li>
                <li>✅ Google Drive integration</li>
                <li>✅ Priority support</li>
              </ul>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => handleUpgrade('Pro')}
              disabled={subscription?.plan_type === 'pro'}
            >
              {subscription?.plan_type === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="plan-card">
            <div className="plan-header">
              <h3>Enterprise</h3>
              <div className="plan-price">
                <span className="price">$29.99</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                <li>✅ Everything in Pro</li>
                <li>✅ API access</li>
                <li>✅ Custom integrations</li>
                <li>✅ Team collaboration</li>
                <li>✅ 24/7 dedicated support</li>
              </ul>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => handleUpgrade('Enterprise')}
              disabled={subscription?.plan_type === 'enterprise'}
            >
              {subscription?.plan_type === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="features-comparison">
        <h2>Feature Comparison</h2>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Projects per month</td>
                <td>5</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>File size limit</td>
                <td>10MB</td>
                <td>100MB</td>
                <td>1GB</td>
              </tr>
              <tr>
                <td>Batch processing</td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Google Drive integration</td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>API access</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>Standard</td>
                <td>Priority</td>
                <td>24/7 Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change my plan anytime?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards and PayPal for secure payments.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>Yes, all new users start with a free plan that includes 5 projects per month.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription; 