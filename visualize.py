import json
import matplotlib.pyplot as plt
from datetime import datetime
from collections import defaultdict

def read_json_data(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data

def visualize_word_occurrences(words, data, words_input):
    # Initialize a dictionary to hold the sum of occurrences for each date
    total_occurrences = defaultdict(int)

    for word in words:
        if word not in data:
            print(f"The word '{word}' is not in the data.")
            continue

        for date, occurrence in data[word].items():
            total_occurrences[date] += occurrence

    if not total_occurrences:
        print("None of the words are in the data.")
        return

    # Extract dates and total occurrences
    dates = [datetime.strptime(date, '%Y-%m-%d') for date in total_occurrences.keys()]
    occurrences = [occurrence for occurrence in total_occurrences.values()]

    # Sort the data by date
    sorted_dates, sorted_occurrences = zip(*sorted(zip(dates, occurrences)))

    # Plot the graph
    plt.figure(figsize=(10, 5))
    plt.plot(sorted_dates, sorted_occurrences, marker='o')
    plt.title(f"Total occurrences of the words {', '.join(words)} over time")
    plt.xlabel('Date')
    plt.ylabel('Total Occurrences')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(words_input + '.png')
    plt.show()

if __name__ == '__main__':
    filename = 'result.json'
    data = read_json_data(filename)

    words_input = input("Enter the words to visualize, separated by commas: ")
    words = [word.strip() for word in words_input.split(',')]
    visualize_word_occurrences(words, data, words_input)
