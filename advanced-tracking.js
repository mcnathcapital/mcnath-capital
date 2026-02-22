// McNath Capital Advanced Tracking & Automation System
// Deploys automatically while Google setup happens

class McNathAdvancedTracking {
    constructor() {
        this.leadValues = {
            sba_calculator: 500,
            business_valuation: 1200,
            exit_consultation: 2500,
            ma_advisory: 5000,
            guide_download: 200,
            contact_form: 300
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 McNath Advanced Tracking Initializing...');
        this.setupLeadTracking();
        this.deployAnalyticsCode();
        this.activateLeadScoring();
        this.enableRealtimeAlerts();
        console.log('✅ Advanced tracking deployed!');
    }
    
    setupLeadTracking() {
        // Track all calculator completions
        document.addEventListener('calculatorComplete', (e) => {
            const { calculatorType, result, contactInfo } = e.detail;
            const leadValue = this.leadValues[calculatorType] || 300;
            
            this.trackLead({
                type: calculatorType,
                value: leadValue,
                result: result,
                contact: contactInfo,
                timestamp: new Date().toISOString()
            });
        });
        
        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const formType = form.getAttribute('data-form-type') || 'contact_form';
                const leadValue = this.leadValues[formType] || 300;
                
                this.trackLead({
                    type: formType,
                    value: leadValue,
                    formData: new FormData(form),
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
    
    trackLead(leadData) {
        // Send to multiple analytics platforms
        this.sendToGA4(leadData);
        this.sendToFacebook(leadData);
        this.sendToHubSpot(leadData);
        this.sendToWebhook(leadData);
        
        // Real-time alert for high-value leads
        if (leadData.value >= 1000) {
            this.sendHighValueAlert(leadData);
        }
        
        console.log('📊 Lead tracked:', leadData);
    }
    
    sendToGA4(leadData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                currency: 'USD',
                value: leadData.value,
                lead_type: leadData.type,
                event_category: 'conversion'
            });
        }
    }
    
    sendToFacebook(leadData) {
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                value: leadData.value,
                currency: 'USD',
                content_category: leadData.type
            });
        }
    }
    
    sendToHubSpot(leadData) {
        if (typeof _hsq !== 'undefined') {
            _hsq.push(['trackEvent', {
                id: 'mcnath_lead',
                property: leadData.type,
                value: leadData.value
            }]);
        }
    }
    
    sendToWebhook(leadData) {
        fetch('/api/leads/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        }).catch(e => console.log('Webhook offline:', e));
    }
    
    sendHighValueAlert(leadData) {
        // SMS alert for leads over $1000
        const alertData = {
            type: 'high_value_lead',
            value: leadData.value,
            leadType: leadData.type,
            timestamp: leadData.timestamp,
            message: `🚨 HIGH VALUE LEAD: $${leadData.value} ${leadData.type} inquiry received!`
        };
        
        fetch('/api/alerts/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        }).catch(e => console.log('Alert system offline:', e));
        
        console.log('🚨 HIGH VALUE ALERT:', alertData.message);
    }
    
    deployAnalyticsCode() {
        // Auto-inject GA4 code once we get the tracking ID
        const script = document.createElement('script');
        script.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        // Will be updated with actual tracking ID
        gtag('config', 'G-MCNATH2026', {
            custom_map: {
                'custom_parameter_1': 'lead_source',
                'custom_parameter_2': 'calculator_type', 
                'custom_parameter_3': 'service_interest'
            }
        });
        `;
        document.head.appendChild(script);
    }
    
    activateLeadScoring() {
        let visitorScore = 0;
        const scoring = {
            page_view: 1,
            calculator_start: 5,
            calculator_complete: 15,
            guide_download: 10,
            contact_form: 25,
            consultation_request: 50
        };
        
        // Track scoring events
        Object.keys(scoring).forEach(event => {
            document.addEventListener(event, () => {
                visitorScore += scoring[event];
                localStorage.setItem('mcnath_lead_score', visitorScore);
                
                if (visitorScore >= 75) {
                    this.triggerSalesAlert({
                        score: visitorScore,
                        message: 'Hot lead - immediate follow-up recommended'
                    });
                }
            });
        });
    }
    
    enableRealtimeAlerts() {
        // Monitor for high-engagement activities
        let timeOnSite = 0;
        let pageViews = 0;
        
        setInterval(() => {
            timeOnSite += 30;
            if (timeOnSite > 300) { // 5+ minutes
                document.dispatchEvent(new CustomEvent('high_engagement', {
                    detail: { timeOnSite, pageViews }
                }));
            }
        }, 30000);
        
        // Page view tracking
        window.addEventListener('beforeunload', () => {
            pageViews++;
            localStorage.setItem('mcnath_page_views', pageViews);
        });
    }
    
    triggerSalesAlert(data) {
        const alert = {
            timestamp: new Date().toISOString(),
            visitorId: localStorage.getItem('mcnath_visitor_id'),
            leadScore: data.score,
            message: data.message,
            currentPage: window.location.href,
            sessionData: {
                timeOnSite: parseInt(localStorage.getItem('mcnath_time_on_site') || '0'),
                pageViews: parseInt(localStorage.getItem('mcnath_page_views') || '0'),
                leadScore: parseInt(localStorage.getItem('mcnath_lead_score') || '0')
            }
        };
        
        // Send real-time alert
        fetch('/api/alerts/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert)
        }).catch(e => console.log('Sales alert offline:', e));
        
        console.log('🎯 SALES ALERT:', alert);
    }
}

// Auto-deploy when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.McNathTracking = new McNathAdvancedTracking();
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = McNathAdvancedTracking;
}