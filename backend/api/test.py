from datetime import *

def get_weeks_of_month(start_date, end_date):
    current_date = start_date
    weeks_dict = {'week': [], 'month': [], 'date': []}
    
    while current_date <= end_date: 
        current_month = current_date.month
        current_year = current_date.year
        first_day_of_month = date(current_year, current_month, 1)
        difference_to_friday = 4 - first_day_of_month.weekday()
        
        if difference_to_friday < 0:
            difference_to_friday += 7
        
        current_date = first_day_of_month + timedelta(days=difference_to_friday)
        week_number = 1
        
        while current_date.month == current_month:
            weeks_dict['week'].append(week_number)
            weeks_dict['month'].append(current_month)
            weeks_dict['date'].append(current_date)
            week_number += 1
            current_date += timedelta(days=7)
        
        current_month += 1
        if current_month > 12:
            current_year += 1
            
    return weeks_dict
        

    
    
teste = get_weeks_of_month(date(2024,1,1), date(2025,1,1))    
print(teste)
