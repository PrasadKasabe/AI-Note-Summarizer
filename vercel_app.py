import os
import sys

# Add the 'backend' directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Import the WSGI application
from core.wsgi import application

# Vercel needs 'app' or 'application'
app = application
