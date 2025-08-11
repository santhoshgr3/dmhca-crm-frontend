#!/bin/bash
# Script to remove ALL mock data from DMHCA CRM frontend

echo "🚫 Removing ALL mock data from DMHCA CRM frontend..."

# Files to clean up
FILES=(
    "src/app/leads/page.tsx"
    "src/app/analytics/page.tsx" 
    "src/app/users/page.tsx"
    "src/components/UserDetailModal.tsx"
    "src/app/hospitals/page.tsx"
    "src/app/courses/page.tsx"
    "src/app/communications/page.tsx"
)

# Search and report mock data usage
echo "📊 Scanning for mock data usage..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Checking $file..."
        
        # Count mock data occurrences
        mock_count=$(grep -c -i "mock\|sample\|demo\|fallback.*data" "$file" 2>/dev/null || true)
        
        if [ $mock_count -gt 0 ]; then
            echo "  ⚠️  Found $mock_count mock data references in $file"
            
            # Show the lines
            grep -n -i "mock\|sample\|demo\|fallback.*data" "$file" 2>/dev/null || true
        else
            echo "  ✅ No mock data found in $file"
        fi
    else
        echo "  ❌ File not found: $file"
    fi
done

echo ""
echo "🔍 Files that need manual cleanup:"
echo "❌ Remove ALL mock data arrays, sample data, and fallback mechanisms"
echo "❌ Remove demo mode detection and warnings"  
echo "❌ Remove local storage simulation"
echo "❌ Remove try/catch blocks with mock data fallbacks"
echo "❌ Remove 'Backend not available' warnings"
echo ""
echo "✅ Replace with:"
echo "✅ Real API calls only"
echo "✅ Proper error handling without fallbacks"
echo "✅ Empty arrays on API failure"
echo "✅ 'Backend connection required' messages"
echo ""
echo "📋 Manual review required for production readiness!"

# Check for specific patterns that need removal
echo "🔍 Checking for specific problematic patterns..."

echo "Mock data arrays:"
find src -name "*.tsx" -exec grep -l "mockData\|sampleData\|const.*Data.*=.*\[" {} \; 2>/dev/null || true

echo ""
echo "Fallback mechanisms:"
find src -name "*.tsx" -exec grep -l "fallback\|catch.*mock\|demo.*mode" {} \; 2>/dev/null || true

echo ""
echo "🎯 Priority files to fix:"
echo "1. src/app/leads/page.tsx"
echo "2. src/app/analytics/page.tsx" 
echo "3. src/app/users/page.tsx"
echo "4. src/components/UserDetailModal.tsx"
echo ""
echo "Remember: The system must ONLY work with real backend API calls!"
