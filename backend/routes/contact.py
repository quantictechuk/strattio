from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/contact")
async def send_contact_email(form_data: ContactForm):
    """
    Send contact form submission to support@strattio.com
    """
    try:
        # Email configuration
        smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_user = os.environ.get("SMTP_USER", "")
        smtp_password = os.environ.get("SMTP_PASSWORD", "")
        support_email = os.environ.get("SUPPORT_EMAIL", "support@strattio.com")
        
        # If SMTP credentials are not configured, log the contact form and return success
        if not smtp_user or not smtp_password:
            logger.info(f"Contact form submission (SMTP not configured):\n"
                      f"Name: {form_data.name}\n"
                      f"Email: {form_data.email}\n"
                      f"Subject: {form_data.subject}\n"
                      f"Message: {form_data.message}")
            return {
                "success": True,
                "message": "Thank you for your message. We'll get back to you soon."
            }
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = support_email
        msg['Subject'] = f"Contact Form: {form_data.subject}"
        msg['Reply-To'] = form_data.email
        
        # Email body
        body = f"""
New contact form submission from Strattio website:

Name: {form_data.name}
Email: {form_data.email}
Subject: {form_data.subject}

Message:
{form_data.message}

---
This email was sent from the Strattio contact form.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Contact form email sent successfully from {form_data.email}")
            
            return {
                "success": True,
                "message": "Thank you for your message. We'll get back to you soon."
            }
        except Exception as e:
            logger.error(f"Failed to send contact email: {str(e)}")
            # Still return success to user, but log the error
            return {
                "success": True,
                "message": "Thank you for your message. We'll get back to you soon."
            }
            
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again later.")
