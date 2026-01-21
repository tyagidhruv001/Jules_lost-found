/**
 * Notification Service
 * Handles email templates and student communication
 */

// Email template definitions
const EMAIL_TEMPLATES = {
    item_found: {
        id: 'item_found',
        name: 'Item Found Notification',
        icon: '🎉',
        subject: 'Good News! We May Have Found Your Lost Item',
        body: `Hi {studentName},

Great news! An item matching your lost item report has been found.

Your Lost Item:
━━━━━━━━━━━━━━━━━━━━
• {itemTitle}
• Category: {category}
• Reported: {reportedDate}
• Location: {location}

Found Item Details:
━━━━━━━━━━━━━━━━━━━━
• Found at: {foundLocation}
• Date Found: {foundDate}

Please visit the GLA Lost & Found portal to review and claim this item if it's yours.

Portal: {portalUrl}

Best regards,
{facultyName}
GLA Lost & Found Team`
    },

    claim_approved: {
        id: 'claim_approved',
        name: 'Claim Approved',
        icon: '✅',
        subject: 'Claim Approved - Please Collect Your Item',
        body: `Hi {studentName},

Congratulations! Your claim for the following item has been approved:

Item Details:
━━━━━━━━━━━━━━━━━━━━
• Item: {itemTitle}
• Category: {category}
• Claim ID: {claimId}
• Approved By: {facultyName}

Next Steps to Collect Your Item:
━━━━━━━━━━━━━━━━━━━━
1. Visit: {pickupLocation}
2. Bring your University ID
3. Mention Claim ID: {claimId}

Office Hours: Monday-Friday, 9:00 AM - 5:00 PM

Please collect your item within 7 days.

Best regards,
GLA Lost & Found Team`
    },

    claim_rejected: {
        id: 'claim_rejected',
        name: 'Claim Rejected',
        icon: '❌',
        subject: 'Claim Status Update',
        body: `Hi {studentName},

Thank you for submitting your claim. After careful review, we're unable to approve your claim for:

Item: {itemTitle}
Claim ID: {claimId}

Reason:
{rejectionReason}

What You Can Do:
━━━━━━━━━━━━━━━━━━━━
• Review the item details again in the portal
• Submit a new claim with additional proof if you have it
• Contact us if you have questions

We're here to help reunite students with their belongings. Feel free to reach out if you need assistance.

Best regards,
{facultyName}
GLA Lost & Found Team`
    },

    match_found: {
        id: 'match_found',
        name: 'Potential Match Found',
        icon: '🔍',
        subject: 'Potential Match for Your {itemType} Item',
        body: `Hi {studentName},

Exciting news! Our smart matching system has identified a potential match for your {itemType} item.

Your Item:
━━━━━━━━━━━━━━━━━━━━
• {yourItem}
• Reported: {yourDate}

Potential Match:
━━━━━━━━━━━━━━━━━━━━
• {matchedItem}
• Match Confidence: {matchScore}%

{otherStudentName} has reported {oppositeAction} this item. We've notified them as well about this potential match.

Next Steps:
━━━━━━━━━━━━━━━━━━━━
• Visit the portal to review the match
• If it's your item, submit a claim
• Contact us if you have questions

Portal: {portalUrl}

Best regards,
GLA Lost & Found Team`
    },

    pickup_reminder: {
        id: 'pickup_reminder',
        name: 'Pickup Reminder',
        icon: '⏰',
        subject: 'Reminder: Please Collect Your Item',
        body: `Hi {studentName},

This is a friendly reminder to collect your claimed item:

Item: {itemTitle}
Claimed: {claimDate}

Collection Details:
━━━━━━━━━━━━━━━━━━━━
• Location: {pickupLocation}
• Hours: Monday-Friday, 9:00 AM - 5:00 PM
• Bring: University ID
• Claim ID: {claimId}

Important: Items not collected within {daysRemaining} days will be returned to storage.

Best regards,
GLA Lost & Found Team`
    },

    custom_message: {
        id: 'custom_message',
        name: 'Custom Message',
        icon: '✉️',
        subject: 'Message from GLA Lost & Found',
        body: `Hi {studentName},

{customMessage}

Best regards,
{facultyName}
GLA Lost & Found Team`
    }
};

/**
 * Get all available email templates
 */
export const getEmailTemplates = () => {
    return Object.values(EMAIL_TEMPLATES);
};

/**
 * Get a specific template by ID
 */
export const getTemplate = (templateId) => {
    return EMAIL_TEMPLATES[templateId] || EMAIL_TEMPLATES.custom_message;
};

/**
 * Render template with variable substitution
 */
export const renderTemplate = (template, variables) => {
    let subject = template.subject;
    let body = template.body;

    // Replace all variables in both subject and body
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        subject = subject.replace(regex, variables[key] || '');
        body = body.replace(regex, variables[key] || '');
    });

    return { subject, body };
};

/**
 * Preview email with current variables
 */
export const previewEmail = (templateId, variables) => {
    const template = getTemplate(templateId);
    return renderTemplate(template, variables);
};

/**
 * Send notification to student via mailto
 */
export const sendNotification = (recipient, templateId, variables) => {
    const template = getTemplate(templateId);
    const { subject, body } = renderTemplate(template, variables);

    // Create mailto URL
    const mailtoUrl = `mailto:${recipient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open in new window/tab
    window.open(mailtoUrl, '_blank');

    return { success: true, subject, body };
};

/**
 * Send to multiple students
 */
export const sendBulkNotifications = (recipients, templateId, variablesArray) => {
    recipients.forEach((recipient, index) => {
        const variables = variablesArray[index] || variablesArray[0];
        setTimeout(() => {
            sendNotification(recipient, templateId, variables);
        }, index * 500); // Delay to prevent browser from blocking multiple popups
    });
};

/**
 * Generate variables from item and student data
 */
export const generateVariables = (student, item, additionalVars = {}) => {
    return {
        studentName: student?.name || 'Student',
        studentEmail: student?.email || '',
        studentId: student?.identifier || '',
        itemTitle: item?.title || 'Item',
        category: item?.category || '',
        color: item?.color || '',
        location: item?.location || '',
        reportedDate: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        itemType: item?.type || 'lost',
        portalUrl: window.location.origin,
        pickupLocation: 'Admin Office, Room 101',
        facultyName: 'Faculty Member',
        ...additionalVars
    };
};

export default {
    getEmailTemplates,
    getTemplate,
    renderTemplate,
    previewEmail,
    sendNotification,
    sendBulkNotifications,
    generateVariables
};
