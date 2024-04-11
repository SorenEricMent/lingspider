import json
import matplotlib.pyplot as plt
from datetime import datetime
from collections import defaultdict
import textwrap

def read_json_data(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data

def visualize_word_occurrences(substrings, data):
    # Initialize a dictionary to hold the sum of occurrences for each date
    total_occurrences = defaultdict(int)
    all_matched_words = set()

    for substring in substrings:
        matched_words = [word for word in data.keys() if substring in word]
        if not matched_words:
            print(f"No words containing '{substring}' found in the data.")
            continue

        all_matched_words.update(matched_words)

        for word in matched_words:
            for date, occurrence in data[word].items():
                total_occurrences[date] += occurrence

    if not total_occurrences:
        print("None of the substrings are found in any words in the data.")
        return

    # Extract dates and total occurrences
    dates = [datetime.strptime(date, '%Y-%m-%d') for date in total_occurrences.keys()]
    occurrences = [occurrence for occurrence in total_occurrences.values()]

    # Sort the data by date
    sorted_dates, sorted_occurrences = zip(*sorted(zip(dates, occurrences)))

    # Plot the graph
    plt.figure(figsize=(10, 7))  # Adjusted figure size to accommodate text
    plt.plot(sorted_dates, sorted_occurrences, marker='o')
    plt.title(f"Total occurrences of words containing {', '.join(substrings)} over time")
    plt.xlabel('Date')
    plt.ylabel('Total Occurrences')
    plt.grid(True)
    plt.xticks(rotation=45)

    # Display matched words under the graph with automatic line breaks
    wrapped_text = textwrap.fill(", ".join(sorted(all_matched_words)), width=80)  # Adjust width as needed
    plt.figtext(0.5, 0.01, f"Matched words: {wrapped_text}", ha='center', va='bottom', fontsize=9, wrap=True)

    plt.tight_layout(rect=[0, 0.05, 1, 0.95])  # Adjust the layout to make room for the text
    plt.show()

if __name__ == '__main__':
    filename = 'result.json'
    data = read_json_data(filename)

    substrings_input = input("Enter the substrings to visualize, separated by commas: ")
    substrings = [substring.strip() for substring in substrings_input.split(',')]
    visualize_word_occurrences(substrings, data)

