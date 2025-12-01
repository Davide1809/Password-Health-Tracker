"""
AI-powered password recommendation utility
"""
import openai
import os
import random
import string
from utils.password_analyzer import analyze_password_strength

openai.api_key = os.environ.get('OPENAI_API_KEY', '')

def generate_recommendations(password):
    """
    Generate AI-powered password improvement recommendations
    
    Args:
        password (str): Password to analyze
        
    Returns:
        list: List of recommendations
    """
    if not openai.api_key:
        return get_default_recommendations()
    
    try:
        prompt = f"""Analyze this password and provide specific, actionable recommendations to make it stronger. 
        Do not reveal the actual password. Focus on:
        1. Adding more character variety
        2. Increasing length
        3. Removing predictable patterns
        4. Making it more memorable but secure
        
        Provide 3-5 specific recommendations."""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': 'You are a cybersecurity expert specializing in password security.'},
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        recommendations_text = response.choices[0].message.content
        return parse_recommendations(recommendations_text)
    
    except Exception as e:
        return get_default_recommendations()

def get_default_recommendations():
    """Return default recommendations if AI is unavailable"""
    return [
        'Increase password length to 16+ characters',
        'Mix uppercase, lowercase, numbers, and special characters',
        'Avoid common words or predictable sequences',
        'Avoid using personal information (names, birthdates)',
        'Use a passphrase with random words for better memorability',
        'Avoid keyboard patterns (qwerty, asdfgh, etc.)',
        'Consider using a password manager to generate and store strong passwords'
    ]

def parse_recommendations(recommendations_text):
    """
    Parse AI recommendations into structured format
    
    Args:
        recommendations_text (str): Raw recommendations from AI
        
    Returns:
        list: Formatted recommendations
    """
    # Split by numbering or bullet points
    lines = recommendations_text.split('\n')
    recommendations = []
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            # Remove numbering
            if line[0].isdigit() and '.' in line[:3]:
                line = line.split('.', 1)[1].strip()
            # Remove bullet points
            if line.startswith('-') or line.startswith('•'):
                line = line[1:].strip()
            
            if line:
                recommendations.append(line)
    
    return recommendations[:7]  # Limit to 7 recommendations

def validate_password_meets_security_rules(password, min_length=12, require_uppercase=True, require_lowercase=True, require_numbers=True, require_special=True):
    """
    Validate password meets defined security rules
    
    Args:
        password (str): Password to validate
        min_length (int): Minimum password length
        require_uppercase (bool): Require at least one uppercase letter
        require_lowercase (bool): Require at least one lowercase letter
        require_numbers (bool): Require at least one number
        require_special (bool): Require at least one special character
        
    Returns:
        tuple: (is_valid, validation_errors)
    """
    errors = []
    
    if len(password) < min_length:
        errors.append(f'Password must be at least {min_length} characters')
    
    if require_uppercase and not any(c.isupper() for c in password):
        errors.append('Password must contain at least one uppercase letter')
    
    if require_lowercase and not any(c.islower() for c in password):
        errors.append('Password must contain at least one lowercase letter')
    
    if require_numbers and not any(c.isdigit() for c in password):
        errors.append('Password must contain at least one number')
    
    if require_special and not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        errors.append('Password must contain at least one special character')
    
    return len(errors) == 0, errors

def generate_strong_password(length=16, use_special=True, use_numbers=True):
    """
    Generate a strong password meeting security rules
    
    Args:
        length (int): Password length (12-32, default 16)
        use_special (bool): Include special characters
        use_numbers (bool): Include numbers
        
    Returns:
        str: Generated password
    """
    # Enforce minimum length of 12
    if length < 12:
        length = 12
    if length > 32:
        length = 32
    
    # Ensure password has required character types
    chars_needed = []
    
    # Always include uppercase and lowercase
    chars_needed.append(random.choice(string.ascii_uppercase))
    chars_needed.append(random.choice(string.ascii_lowercase))
    
    # Add numbers if requested
    if use_numbers:
        chars_needed.append(random.choice(string.digits))
    
    # Add special character if requested
    if use_special:
        special_chars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
        chars_needed.append(random.choice(special_chars))
    
    # Build character pool for remaining positions
    char_pool = string.ascii_letters
    if use_numbers:
        char_pool += string.digits
    if use_special:
        char_pool += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    # Fill remaining positions
    remaining_length = length - len(chars_needed)
    chars_needed.extend(random.choice(char_pool) for _ in range(remaining_length))
    
    # Shuffle to avoid predictable pattern (required chars at start)
    password_list = chars_needed
    random.shuffle(password_list)
    password = ''.join(password_list)
    
    # Validate it meets rules
    is_valid, errors = validate_password_meets_security_rules(password, use_special=use_special, require_numbers=use_numbers)
    if not is_valid:
        # Regenerate if validation fails (rare case)
        return generate_strong_password(length, use_special, use_numbers)
    
    return password

def generate_ai_password_suggestions(count=3, length=16):
    """
    Generate multiple AI-driven password suggestions
    Uses OpenAI to create memorable yet secure password patterns
    
    Args:
        count (int): Number of suggestions to generate
        length (int): Desired password length
        
    Returns:
        list: List of generated passwords
    """
    if not openai.api_key:
        # Fallback to random generation if no API key
        return [generate_strong_password(length) for _ in range(count)]
    
    try:
        prompt = f"""Generate {count} strong, unique passwords that:
        1. Are exactly {length} characters long
        2. Contain uppercase letters, lowercase letters, numbers, and special characters
        3. Are NOT simple patterns or dictionary words
        4. Are optimized for security and memorability
        5. Do NOT share common patterns between suggestions
        
        Format: Return ONLY the passwords, one per line, nothing else."""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': 'You are a cybersecurity expert. Generate only strong, random passwords.'},
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=200,
            temperature=1.0  # High temperature for better randomness
        )
        
        suggestions_text = response.choices[0].message.content
        passwords = []
        
        for line in suggestions_text.strip().split('\n'):
            line = line.strip()
            if line and len(line) >= 12:  # Ensure minimum length
                # Clean up any numbering or bullet points
                if line[0].isdigit() and '.' in line[:3]:
                    line = line.split('.', 1)[1].strip()
                if line.startswith('-') or line.startswith('•'):
                    line = line[1:].strip()
                
                # Validate password meets security rules
                is_valid, _ = validate_password_meets_security_rules(line, min_length=length-1)
                if is_valid and len(line) <= length + 2:  # Allow slight variance
                    passwords.append(line)
        
        # If we don't have enough valid passwords from AI, supplement with generated ones
        while len(passwords) < count:
            passwords.append(generate_strong_password(length))
        
        return passwords[:count]
    
    except Exception as e:
        # Fallback to random generation on error
        return [generate_strong_password(length) for _ in range(count)]
