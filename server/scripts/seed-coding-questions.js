/**
 * Seed script for GECRPlacement Coding Directory.
 *
 * Uses EXCLUSIVELY the 24 authentic recruiting companies from GECR database.
 * Every question has a canonical externalUrl to solve on LeetCode, GeeksforGeeks, or HackerRank.
 * Zero in-site compiler overhead.
 *
 * Usage:
 *   node scripts/seed-coding-questions.js [--dry-run]
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const CodingQuestion = require('../src/models/CodingQuestion');

const isDryRun = process.argv.includes('--dry-run');

const QUESTIONS = [
  {
    "slug": "find-max-in-array",
    "title": "Find Maximum Element in Array",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4618/1",
    "companyTags": [
      "Kevit Technologies",
      "eSparkBiz"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Reported in eSparkBiz Pen-Paper round and Kevit Technologies technical interview.",
    "statement": "Given an array nums of size n, return the maximum element in the array.",
    "constraints": "1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9",
    "examples": [
      {
        "input": "nums = [3, 1, 4, 1, 5, 9, 2, 6]",
        "output": "9",
        "explanation": "9 is the largest element."
      }
    ]
  },
  {
    "slug": "second-largest-element",
    "title": "Second Largest Element in Array",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/second-largest3735/1",
    "companyTags": [
      "eSparkBiz",
      "Tark Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Asked in eSparkBiz Pen-Paper Coding Round and Tark Technologies Section 2.",
    "statement": "Given an array of positive integers, return the second largest distinct element from the array. If no second largest exists, return -1.",
    "constraints": "2 <= nums.length <= 10^5, 1 <= nums[i] <= 10^5",
    "examples": [
      {
        "input": "nums = [12, 35, 1, 10, 34, 1]",
        "output": "34",
        "explanation": "The largest element is 35 and the second largest is 34."
      }
    ]
  },
  {
    "slug": "reverse-array",
    "title": "Reverse an Array",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/reverse-an-array/0",
    "companyTags": [
      "eSparkBiz"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Direct question from eSparkBiz Round 2 (Pen-Paper Coding).",
    "statement": "You are given an array of integers. You need to reverse the array in-place.",
    "constraints": "1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9",
    "examples": [
      {
        "input": "nums = [1, 2, 3, 4, 5]",
        "output": "[5, 4, 3, 2, 1]",
        "explanation": "Reversed order of elements."
      }
    ]
  },
  {
    "slug": "move-zeroes-to-end",
    "title": "Move Zeroes to End",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/move-zeroes/",
    "companyTags": [
      "Tark Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Array manipulation pattern tested in Tark Technologies technical coding test.",
    "statement": "Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements in-place.",
    "constraints": "1 <= nums.length <= 10^4, -2^31 <= nums[i] <= 2^31 - 1",
    "examples": [
      {
        "input": "nums = [0, 1, 0, 3, 12]",
        "output": "[1, 3, 12, 0, 0]",
        "explanation": "All zeroes shifted to the right."
      }
    ]
  },
  {
    "slug": "count-duplicates-in-array",
    "title": "Contains Duplicate",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/contains-duplicate/",
    "companyTags": [
      "TatvaSoft",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Asked in TatvaSoft technical interview and Version Systems Set B.",
    "statement": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    "constraints": "1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9",
    "examples": [
      {
        "input": "nums = [1, 2, 3, 1]",
        "output": "true",
        "explanation": "1 appears twice."
      }
    ]
  },
  {
    "slug": "two-sum",
    "title": "Two Sum",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/two-sum/",
    "companyTags": [
      "eSparkBiz",
      "Prominent Pixel"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Foundational array hashing challenge in campus placement screening.",
    "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "nums[0] + nums[1] == 9."
      }
    ]
  },
  {
    "slug": "best-time-to-buy-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Fintech algorithmic problem tested at TSS Consultancy.",
    "statement": "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve from this transaction.",
    "constraints": "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4",
    "examples": [
      {
        "input": "prices = [7, 1, 5, 3, 6, 4]",
        "output": "5",
        "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
      }
    ]
  },
  {
    "slug": "intersection-of-two-arrays",
    "title": "Intersection of Two Arrays",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/intersection-of-two-arrays/",
    "companyTags": [
      "eSparkBiz"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Explicitly asked in eSparkBiz Pen-Paper coding round: \"Find Intersection in two arrays\".",
    "statement": "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique.",
    "constraints": "1 <= nums1.length, nums2.length <= 1000",
    "examples": [
      {
        "input": "nums1 = [1, 2, 2, 1], nums2 = [2, 2]",
        "output": "[2]",
        "explanation": "Common distinct element is 2."
      }
    ]
  },
  {
    "slug": "merge-sorted-array",
    "title": "Merge Sorted Array",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/merge-sorted-array/",
    "companyTags": [
      "Gateway Group",
      "Silent Infotech"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Two-pointer array problem common in Gateway Group technical interviews.",
    "statement": "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array.",
    "constraints": "nums1.length == m + n, nums2.length == n",
    "examples": [
      {
        "input": "nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3",
        "output": "[1, 2, 2, 3, 5, 6]",
        "explanation": "Arrays merged in-place."
      }
    ]
  },
  {
    "slug": "majority-element",
    "title": "Majority Element",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/majority-element/",
    "companyTags": [
      "Tark Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Boyer-Moore voting pattern tested in Tark Technologies placement tests.",
    "statement": "Given an array nums of size n, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times.",
    "constraints": "1 <= nums.length <= 5 * 10^4",
    "examples": [
      {
        "input": "nums = [3, 2, 3]",
        "output": "3",
        "explanation": "3 appears 2 times, which is > 3/2."
      }
    ]
  },
  {
    "slug": "kadane-maximum-subarray",
    "title": "Maximum Subarray (Kadanes Algorithm)",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/maximum-subarray/",
    "companyTags": [
      "Prominent Pixel",
      "TatvaSoft"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Standard contiguous subarray problem asked in Prominent Pixel technical rounds.",
    "statement": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    "constraints": "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
    "examples": [
      {
        "input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        "output": "6",
        "explanation": "The subarray [4, -1, 2, 1] has the largest sum 6."
      }
    ]
  },
  {
    "slug": "sort-colors",
    "title": "Sort Colors (Dutch National Flag)",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/sort-colors/",
    "companyTags": [
      "eSparkBiz",
      "TatvaSoft"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Three-way partitioning array question tested in eSparkBiz and TatvaSoft.",
    "statement": "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue (0, 1, and 2).",
    "constraints": "n == nums.length, 1 <= n <= 300, nums[i] is either 0, 1, or 2",
    "examples": [
      {
        "input": "nums = [2, 0, 2, 1, 1, 0]",
        "output": "[0, 0, 1, 1, 2, 2]",
        "explanation": "Sorted in O(n) one pass."
      }
    ]
  },
  {
    "slug": "rotate-array",
    "title": "Rotate Array",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/rotate-array/",
    "companyTags": [
      "Kevit Technologies",
      "Gateway Group"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Array shifting and rotation problem asked at Kevit Technologies.",
    "statement": "Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.",
    "constraints": "1 <= nums.length <= 10^5, 0 <= k <= 10^5",
    "examples": [
      {
        "input": "nums = [1, 2, 3, 4, 5, 6, 7], k = 3",
        "output": "[5, 6, 7, 1, 2, 3, 4]",
        "explanation": "Rotated 3 steps right."
      }
    ]
  },
  {
    "slug": "spiral-matrix",
    "title": "Spiral Matrix",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/spiral-matrix/",
    "companyTags": [
      "Prominent Pixel",
      "Kevit Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Direct question from Prominent Pixel placement paper: \"6. Spiral Matrix: Given an m x n matrix, return all elements in spiral order.\"",
    "statement": "Given an m x n matrix, return all elements of the matrix in spiral order.",
    "constraints": "m == matrix.length, n == matrix[i].length, 1 <= m, n <= 10",
    "examples": [
      {
        "input": "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        "output": "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
        "explanation": "Spiral clockwise traversal."
      }
    ]
  },
  {
    "slug": "search-a-2d-matrix",
    "title": "Search a 2D Matrix",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/search-a-2d-matrix/",
    "companyTags": [
      "Kevit Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Kevit Technologies Technical Round 2: \"1 question from Matrix (2D array)\".",
    "statement": "You are given an m x n integer matrix matrix with properties: each row is sorted, and the first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in matrix.",
    "constraints": "m == matrix.length, n == matrix[i].length, 1 <= m, n <= 100",
    "examples": [
      {
        "input": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
        "output": "true",
        "explanation": "3 is present at (0, 1)."
      }
    ]
  },
  {
    "slug": "trapping-rain-water",
    "title": "Trapping Rain Water",
    "category": "DSA",
    "topic": "Array",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/trapping-rain-water/",
    "companyTags": [
      "Prominent Pixel",
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Advanced algorithmic problem asked in senior developer technical rounds at TSS and Prominent Pixel.",
    "statement": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    "constraints": "n == height.length, 1 <= n <= 2 * 10^4, 0 <= height[i] <= 10^5",
    "examples": [
      {
        "input": "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        "output": "6",
        "explanation": "6 units of rain water are being trapped."
      }
    ]
  },
  {
    "slug": "reverse-a-string",
    "title": "Reverse String",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/reverse-string/",
    "companyTags": [
      "RKIT Software Pvt Ltd",
      "eSparkBiz"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "RKIT Software Written Test: \"Output of Java Program (reverse string)\" and eSparkBiz technical round.",
    "statement": "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    "constraints": "1 <= s.length <= 10^5",
    "examples": [
      {
        "input": "s = [\"h\", \"e\", \"l\", \"l\", \"o\"]",
        "output": "[\"o\", \"l\", \"l\", \"e\", \"h\"]",
        "explanation": "Reversed in-place."
      }
    ]
  },
  {
    "slug": "check-palindrome-string",
    "title": "Valid Palindrome",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/valid-palindrome/",
    "companyTags": [
      "eSparkBiz",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Reported in eSparkBiz Pen-Paper round and Version Systems Set A test.",
    "statement": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome.",
    "constraints": "1 <= s.length <= 2 * 10^5",
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true",
        "explanation": "\"amanaplanacanalpanama\" is a palindrome."
      }
    ]
  },
  {
    "slug": "count-vowels-consonants",
    "title": "Count Vowels and Consonants in String",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/consonants-and-vowels-check/1",
    "companyTags": [
      "eSparkBiz",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Set A: \"Count vowels and consonants from given string\" and eSparkBiz coding round.",
    "statement": "Given a string s, count the number of vowels and consonants present in the string. Ignore whitespace and special characters.",
    "constraints": "1 <= s.length <= 10^5",
    "examples": [
      {
        "input": "s = \"gec rajkot\"",
        "output": "Vowels: 3, Consonants: 6",
        "explanation": "e, a, o are vowels; g, c, r, j, k, t are consonants."
      }
    ]
  },
  {
    "slug": "anagram-check",
    "title": "Valid Anagram",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/valid-anagram/",
    "companyTags": [
      "eSparkBiz",
      "Silent Infotech"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "eSparkBiz Round 2: \"Check how many times each character appears in a given string\" (Frequency & Anagram logic).",
    "statement": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    "constraints": "1 <= s.length, t.length <= 5 * 10^4",
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true",
        "explanation": "Both strings have identical character frequencies."
      }
    ]
  },
  {
    "slug": "longest-substring-without-repeating",
    "title": "Longest Substring Without Repeating Characters",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "companyTags": [
      "Prominent Pixel",
      "TatvaSoft"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Prominent Pixel Round 1: \"First Non-Repeating Element in Window\" & sliding window challenges.",
    "statement": "Given a string s, find the length of the longest substring without duplicate characters.",
    "constraints": "0 <= s.length <= 5 * 10^4",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      }
    ]
  },
  {
    "slug": "first-unique-character",
    "title": "First Unique Character in a String",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/first-unique-character-in-a-string/",
    "companyTags": [
      "eSparkBiz",
      "Prominent Pixel"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "eSparkBiz: \"Check occurrence of each character in String\" and Prominent Pixel non-repeating element questions.",
    "statement": "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    "constraints": "1 <= s.length <= 10^5",
    "examples": [
      {
        "input": "s = \"leetcode\"",
        "output": "0",
        "explanation": "Character \"l\" at index 0 is the first unique character."
      }
    ]
  },
  {
    "slug": "word-break",
    "title": "Word Break",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/word-break/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Directly reported in TSS Consultancy Round 3: \"LeetCode problem number 139 (Word Break)\".",
    "statement": "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    "constraints": "1 <= s.length <= 300, 1 <= wordDict.length <= 1000",
    "examples": [
      {
        "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        "output": "true",
        "explanation": "Return true because \"leetcode\" can be segmented as \"leet code\"."
      }
    ]
  },
  {
    "slug": "minimum-window-substring",
    "title": "Minimum Window Substring",
    "category": "DSA",
    "topic": "String",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/minimum-window-substring/",
    "companyTags": [
      "Prominent Pixel"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Advanced sliding window question asked in Prominent Pixel senior technical interviews.",
    "statement": "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    "constraints": "m == s.length, n == t.length, 1 <= m, n <= 10^5",
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\"",
        "explanation": "The minimum window substring \"BANC\" includes A, B, and C."
      }
    ]
  },
  {
    "slug": "reverse-linked-list",
    "title": "Reverse Linked List",
    "category": "DSA",
    "topic": "Linked List",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/reverse-linked-list/",
    "companyTags": [
      "Version Systems",
      "Tark Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Set B: \"Reverse a given linked list\" and Tark Technologies Section 3.",
    "statement": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    "constraints": "The number of nodes in the list is the range [0, 5000], -5000 <= Node.val <= 5000",
    "examples": [
      {
        "input": "head = [1, 2, 3, 4, 5]",
        "output": "[5, 4, 3, 2, 1]",
        "explanation": "Reversed pointer direction."
      }
    ]
  },
  {
    "slug": "detect-cycle-linked-list",
    "title": "Linked List Cycle",
    "category": "DSA",
    "topic": "Linked List",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/linked-list-cycle/",
    "companyTags": [
      "Tark Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Floyd cycle detection problem tested in Tark Technologies placement tests.",
    "statement": "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle, otherwise false.",
    "constraints": "The number of the nodes in the list is in the range [0, 10^4]",
    "examples": [
      {
        "input": "head = [3, 2, 0, -4], pos = 1",
        "output": "true",
        "explanation": "There is a cycle where tail connects to 1st node."
      }
    ]
  },
  {
    "slug": "remove-linked-list-elements",
    "title": "Remove Linked List Elements",
    "category": "DSA",
    "topic": "Linked List",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/remove-linked-list-elements/",
    "companyTags": [
      "Tark Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Tark Technologies Section 3: \"Implement functions for removing given element from encapsulated LinkedList\".",
    "statement": "Given the head of a linked list and an integer val, remove all the nodes of the linked list that has Node.val == val, and return the new head.",
    "constraints": "The number of nodes in the list is in the range [0, 10^4]",
    "examples": [
      {
        "input": "head = [1, 2, 6, 3, 4, 5, 6], val = 6",
        "output": "[1, 2, 3, 4, 5]",
        "explanation": "All nodes with value 6 removed."
      }
    ]
  },
  {
    "slug": "merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "category": "DSA",
    "topic": "Linked List",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "companyTags": [
      "Silent Infotech",
      "Gateway Group"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Standard pointer manipulation challenge in campus technical interviews.",
    "statement": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together nodes.",
    "constraints": "The number of nodes in both lists is in the range [0, 50]",
    "examples": [
      {
        "input": "list1 = [1, 2, 4], list2 = [1, 3, 4]",
        "output": "[1, 1, 2, 3, 4, 4]",
        "explanation": "Merged sorted list."
      }
    ]
  },
  {
    "slug": "remove-nth-node-from-end",
    "title": "Remove Nth Node From End of List",
    "category": "DSA",
    "topic": "Linked List",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "companyTags": [
      "Tark Technologies",
      "Kevit Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Two-pointer fast & slow pointer challenge asked in GECR placement rounds.",
    "statement": "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    "constraints": "The number of nodes in the list is sz. 1 <= sz <= 30",
    "examples": [
      {
        "input": "head = [1, 2, 3, 4, 5], n = 2",
        "output": "[1, 2, 3, 5]",
        "explanation": "2nd node from end (node 4) is removed."
      }
    ]
  },
  {
    "slug": "valid-parentheses",
    "title": "Valid Parentheses",
    "category": "DSA",
    "topic": "Stack",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/valid-parentheses/",
    "companyTags": [
      "RKIT Software Pvt Ltd",
      "Kevit Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Essential stack verification problem in RKIT and Kevit assessments.",
    "statement": "Given a string s containing just the characters \"(\", \")\", \"{\", \"}\", \"[\" and \"]\", determine if the input string is valid.",
    "constraints": "1 <= s.length <= 10^4",
    "examples": [
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "Open brackets closed by same type in correct order."
      }
    ]
  },
  {
    "slug": "next-greater-element",
    "title": "Next Greater Element I",
    "category": "DSA",
    "topic": "Stack",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/next-greater-element-i/",
    "companyTags": [
      "Prominent Pixel"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Prominent Pixel placement paper: \"3. Next Greater Element: Given an array of integers, for every element find the first greater element to its right.\"",
    "statement": "The next greater element of some element x in an array is the first greater element that is to the right of x in the same array. Return an array ans of length nums1.length.",
    "constraints": "1 <= nums1.length <= nums2.length <= 1000",
    "examples": [
      {
        "input": "nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]",
        "output": "[-1, 3, -1]",
        "explanation": "For 4: none (-1); For 1: next greater is 3; For 2: none (-1)."
      }
    ]
  },
  {
    "slug": "min-stack",
    "title": "Min Stack",
    "category": "DSA",
    "topic": "Stack",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/min-stack/",
    "companyTags": [
      "TatvaSoft",
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Auxiliary stack data structure design problem common in placement interviews.",
    "statement": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).",
    "constraints": "Methods pop, top and getMin operations will always be called on non-empty stacks.",
    "examples": [
      {
        "input": "[\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"]",
        "output": "[null,null,null,null,-3,null,0,-2]",
        "explanation": "getMin() returns min in O(1)."
      }
    ]
  },
  {
    "slug": "first-negative-in-window",
    "title": "First Negative Integer in Every Window of Size K",
    "category": "DSA",
    "topic": "Queue",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1",
    "companyTags": [
      "Prominent Pixel"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Prominent Pixel Round 1: \"First Non-Repeating / First Negative Element in Every Window of size K\".",
    "statement": "Given an array A[] of size N and a positive integer K, find the first negative integer for each and every contiguous window of size K. If a window does not contain a negative integer, then return 0 for that window.",
    "constraints": "1 <= N <= 10^5, 1 <= K <= N",
    "examples": [
      {
        "input": "A = [-8, 2, 3, -6, 10], K = 2",
        "output": "[-8, 0, -6, -6]",
        "explanation": "First negative element in each 2-element window."
      }
    ]
  },
  {
    "slug": "implement-queue-using-stacks",
    "title": "Implement Queue using Stacks",
    "category": "DSA",
    "topic": "Queue",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "companyTags": [
      "Zeus Learning",
      "RKIT Software Pvt Ltd"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "RKIT Software: \"Write 4 Data Structures and methods of each\" & data structure implementations.",
    "statement": "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support push, pop, peek, and empty.",
    "constraints": "1 <= x <= 9, at most 100 calls will be made to push, pop, peek, and empty.",
    "examples": [
      {
        "input": "[\"MyQueue\", \"push\", \"push\", \"peek\", \"pop\", \"empty\"]",
        "output": "[null, null, null, 1, 1, false]",
        "explanation": "FIFO queue simulated with 2 LIFO stacks."
      }
    ]
  },
  {
    "slug": "binary-tree-inorder",
    "title": "Binary Tree Inorder Traversal",
    "category": "DSA",
    "topic": "Tree",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "companyTags": [
      "Zeus Learning",
      "Prominent Pixel"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Tree recursion and traversal question tested at Zeus Learning and Prominent Pixel.",
    "statement": "Given the root of a binary tree, return the inorder traversal of its nodes values.",
    "constraints": "The number of nodes in the tree is in the range [0, 100], -100 <= Node.val <= 100",
    "examples": [
      {
        "input": "root = [1, null, 2, 3]",
        "output": "[1, 3, 2]",
        "explanation": "Left-Root-Right traversal."
      }
    ]
  },
  {
    "slug": "max-depth-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "category": "DSA",
    "topic": "Tree",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "companyTags": [
      "Zeus Learning"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Binary tree recursion question common in campus placement drives.",
    "statement": "Given the root of a binary tree, return its maximum depth. A binary tree maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    "constraints": "The number of nodes in the tree is in the range [0, 10^4]",
    "examples": [
      {
        "input": "root = [3, 9, 20, null, null, 15, 7]",
        "output": "3",
        "explanation": "Depth along path 3->20->15 is 3."
      }
    ]
  },
  {
    "slug": "invert-binary-tree",
    "title": "Invert Binary Tree",
    "category": "DSA",
    "topic": "Tree",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/invert-binary-tree/",
    "companyTags": [
      "Zeus Learning",
      "Improwised Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Classic tree structure manipulation question.",
    "statement": "Given the root of a binary tree, invert the tree, and return its root.",
    "constraints": "The number of nodes in the tree is in the range [0, 100]",
    "examples": [
      {
        "input": "root = [4, 2, 7, 1, 3, 6, 9]",
        "output": "[4, 7, 2, 9, 6, 3, 1]",
        "explanation": "Left and right children swapped recursively."
      }
    ]
  },
  {
    "slug": "validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "category": "DSA",
    "topic": "Tree",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/validate-binary-search-tree/",
    "companyTags": [
      "TSS Consultancy Private Limited",
      "Zeus Learning"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "BST property verification question asked at TSS Consultancy.",
    "statement": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    "constraints": "The number of nodes in the tree is in the range [1, 10^4]",
    "examples": [
      {
        "input": "root = [2, 1, 3]",
        "output": "true",
        "explanation": "Left child < root < right child everywhere."
      }
    ]
  },
  {
    "slug": "bfs-graph-traversal",
    "title": "BFS of Graph",
    "category": "DSA",
    "topic": "Graph",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
    "companyTags": [
      "Kevit Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Kevit Technologies Round 3: \"Very deep concept of Computer Networks (Routing algorithm, DNS, Graph BFS)\".",
    "statement": "Given a connected undirected graph represented by an adjacency list adj, return a list containing the BFS traversal of the graph starting from vertex 0.",
    "constraints": "1 <= V, E <= 10^4",
    "examples": [
      {
        "input": "V = 5, adj = [[1, 2, 3], [], [4], [], []]",
        "output": "[0, 1, 2, 3, 4]",
        "explanation": "Level-order graph search from vertex 0."
      }
    ]
  },
  {
    "slug": "number-of-islands",
    "title": "Number of Islands (Matrix Graph Traversal)",
    "category": "DSA",
    "topic": "Graph",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/number-of-islands/",
    "companyTags": [
      "Prominent Pixel",
      "Kevit Technologies"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Connected components 2D grid question asked in Prominent Pixel and Kevit matrix rounds.",
    "statement": "Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands.",
    "constraints": "m == grid.length, n == grid[i].length, 1 <= m, n <= 300",
    "examples": [
      {
        "input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
        "output": "2",
        "explanation": "Two connected land clusters."
      }
    ]
  },
  {
    "slug": "sql-second-highest-salary",
    "title": "Second Highest Salary",
    "category": "SQL",
    "topic": "",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/second-highest-salary/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "TSS Consultancy Round 2 Technical: \"1-2 SQL queries normal like second highest salary\".",
    "statement": "Write a solution to find the second highest distinct salary from the Employee table. If there is no second highest salary, return null.",
    "constraints": "Employee table with id (primary key) and salary (int).",
    "examples": [
      {
        "input": "Employee = [[1, 100], [2, 200], [3, 300]]",
        "output": "200",
        "explanation": "200 is the second highest distinct salary."
      }
    ]
  },
  {
    "slug": "sql-department-highest-salary",
    "title": "Department Highest Salary",
    "category": "SQL",
    "topic": "",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/department-highest-salary/",
    "companyTags": [
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Set B: \"Department and employee table SQL queries and subqueries\".",
    "statement": "Write a solution to find employees who have the highest salary in each of the departments.",
    "constraints": "Employee and Department tables linked by departmentId.",
    "examples": [
      {
        "input": "IT: [Max 90000, Joe 85000], Sales: [Henry 80000]",
        "output": "Max (IT 90000), Henry (Sales 80000)",
        "explanation": "Highest earner per department."
      }
    ]
  },
  {
    "slug": "sql-select-all",
    "title": "Basic SQL SELECT Queries and Filtering",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "HackerRank",
    "externalUrl": "https://www.hackerrank.com/challenges/revising-the-select-query/problem",
    "companyTags": [
      "GN Websoft"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "GN Websoft Round 1: \"10 basic SQL queries: INSERT, UPDATE, DELETE, and RETRIEVE\".",
    "statement": "Query all columns for all American cities in the CITY table with populations larger than 100,000. The CountryCode for America is USA.",
    "constraints": "CITY table with ID, NAME, COUNTRYCODE, DISTRICT, POPULATION.",
    "examples": [
      {
        "input": "Populations with > 100000 and USA",
        "output": "Matching city records",
        "explanation": "Filtered SELECT query with WHERE clause."
      }
    ]
  },
  {
    "slug": "sql-join-orders",
    "title": "Customers Who Never Order (SQL Left Join)",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/customers-who-never-order/",
    "companyTags": [
      "Shaligram Infotech",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Shaligram Infotech technical interview: \"Customer, Order, Supplier multi-table SQL queries\" and Version Systems Left Joins.",
    "statement": "Write a solution to find all customers who never order anything. Table: Customers (id, name), Table: Orders (id, customerId).",
    "constraints": "customerId is a foreign key of id from Customers.",
    "examples": [
      {
        "input": "Customers = [[1, \"Joe\"], [2, \"Henry\"], [3, \"Sam\"]], Orders = [[1, 3], [2, 1]]",
        "output": "[\"Henry\"]",
        "explanation": "Henry never placed an order."
      }
    ]
  },
  {
    "slug": "sql-count-group-by",
    "title": "GROUP BY and HAVING Aggregate Queries",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "HackerRank",
    "externalUrl": "https://www.hackerrank.com/challenges/weather-observation-station-4/problem",
    "companyTags": [
      "Gateway Group",
      "Tark Technologies"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Gateway Group Round: \"SQL query containing GROUP BY, HAVING, and ORDER BY clauses\" and Tark Technologies Section 5.",
    "statement": "Find the difference between the total number of CITY entries in the table and the number of distinct CITY entries in the table.",
    "constraints": "STATION table with ID, CITY, STATE.",
    "examples": [
      {
        "input": "Total cities = 10, Distinct = 8",
        "output": "2",
        "explanation": "COUNT(CITY) - COUNT(DISTINCT CITY) = 2."
      }
    ]
  },
  {
    "slug": "combine-two-tables",
    "title": "Combine Two Tables (Outer Join)",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/combine-two-tables/",
    "companyTags": [
      "Tark Technologies",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Technical: \"Left Joins related SQL query implementation and behavior with null values\".",
    "statement": "Write a solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not present, report null.",
    "constraints": "Person (personId, lastName, firstName), Address (addressId, personId, city, state).",
    "examples": [
      {
        "input": "Person without address record",
        "output": "FirstName, LastName, null, null",
        "explanation": "LEFT JOIN retains Person record with null address."
      }
    ]
  },
  {
    "slug": "employees-earning-more",
    "title": "Employees Earning More Than Their Managers",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/employees-earning-more-than-their-managers/",
    "companyTags": [
      "TatvaSoft",
      "eSparkBiz"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "TatvaSoft Technical: \"DBMS Concept & Perform sql Queries: Self joins on employee table\".",
    "statement": "Write a solution to find the employees who earn more than their managers. Return the result table in any order.",
    "constraints": "Employee (id, name, salary, managerId).",
    "examples": [
      {
        "input": "Joe (Salary 70000, Manager Sam 60000)",
        "output": "Joe",
        "explanation": "Joe earns more than his manager Sam."
      }
    ]
  },
  {
    "slug": "duplicate-emails",
    "title": "Duplicate Emails",
    "category": "SQL",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/duplicate-emails/",
    "companyTags": [
      "Shaligram Infotech",
      "Vivansh Infotech"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Shaligram Infotech on-campus technical round SQL queries.",
    "statement": "Write a solution to report all the duplicate emails. Note that its guaranteed the email field is not NULL.",
    "constraints": "Person (id, email).",
    "examples": [
      {
        "input": "Person with emails [\"a@b.com\", \"c@d.com\", \"a@b.com\"]",
        "output": "[\"a@b.com\"]",
        "explanation": "a@b.com appears more than once."
      }
    ]
  },
  {
    "slug": "fibonacci-nth",
    "title": "N-th Fibonacci Number",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/fibonacci-number/",
    "companyTags": [
      "eSparkBiz",
      "Atri Solutions"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "eSparkBiz: \"Implement a recursive function to print Fibonacci series\" & Atri Solutions Golden Ratio questions.",
    "statement": "The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
    "constraints": "0 <= n <= 30",
    "examples": [
      {
        "input": "n = 4",
        "output": "3",
        "explanation": "F(4) = F(3) + F(2) = 2 + 1 = 3."
      }
    ]
  },
  {
    "slug": "prime-check",
    "title": "Check for Prime Number",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/prime-number2314/1",
    "companyTags": [
      "eSparkBiz",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "eSparkBiz and Version Systems written test programming section.",
    "statement": "For a given number n, check if it is prime or not. A prime number is a number greater than 1 that has no positive divisors other than 1 and itself.",
    "constraints": "1 <= n <= 10^9",
    "examples": [
      {
        "input": "n = 5",
        "output": "true",
        "explanation": "5 has no other divisor than 1 and 5."
      }
    ]
  },
  {
    "slug": "factorial-large-number",
    "title": "Factorial of a Number (Recursion)",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1",
    "companyTags": [
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Set A: \"Factorial using recursion function\".",
    "statement": "Given an integer N, find the factorial of the given number. Factorial of N is the product of all integers from 1 to N.",
    "constraints": "1 <= N <= 1000",
    "examples": [
      {
        "input": "N = 5",
        "output": "120",
        "explanation": "5 * 4 * 3 * 2 * 1 = 120."
      }
    ]
  },
  {
    "slug": "binary-search",
    "title": "Binary Search",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/binary-search/",
    "companyTags": [
      "Kevit Technologies",
      "Version Systems"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "Version Systems Round 3: \"Check whether a given integer exists in 100,000 list efficiently\".",
    "statement": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1 in O(log n) time.",
    "constraints": "1 <= nums.length <= 10^4, -10^4 < nums[i], target < 10^4",
    "examples": [
      {
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        "output": "4",
        "explanation": "9 exists in nums and its index is 4."
      }
    ]
  },
  {
    "slug": "gcd-lcm",
    "title": "GCD and LCM (Euclidean Algorithm)",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "externalUrl": "https://www.geeksforgeeks.org/problems/lcm-and-gcd4516/1",
    "companyTags": [
      "Atri Solutions"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Mathematical aptitude and logic test at Atri Solutions.",
    "statement": "Given two integers a and b, calculate their greatest common divisor (GCD) and least common multiple (LCM).",
    "constraints": "1 <= a, b <= 10^9",
    "examples": [
      {
        "input": "a = 5, b = 10",
        "output": "GCD: 5, LCM: 10",
        "explanation": "GCD(5, 10) = 5, LCM(5, 10) = 10."
      }
    ]
  },
  {
    "slug": "josephus-problem",
    "title": "Find the Winner of the Circular Game (Josephus Problem)",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/find-the-winner-of-the-circular-game/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "verified-pyq",
    "interviewContext": "TSS Consultancy Round 3: \"Josephus problem implementation and solution\".",
    "statement": "There are n friends that are playing a game. Starting with the 1st friend, count k friends clockwise. The kth friend is eliminated. Return the friend who wins the game.",
    "constraints": "1 <= k <= n <= 500",
    "examples": [
      {
        "input": "n = 5, k = 2",
        "output": "3",
        "explanation": "Elimination order: 2, 4, 1, 5. Friend 3 wins."
      }
    ]
  },
  {
    "slug": "climbing-stairs",
    "title": "Climbing Stairs",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/climbing-stairs/",
    "companyTags": [
      "TSS Consultancy Private Limited",
      "TatvaSoft"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "Dynamic programming / Fibonacci pattern problem in technical interviews.",
    "statement": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "constraints": "1 <= n <= 45",
    "examples": [
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "Three ways: 1+1+1, 1+2, 2+1."
      }
    ]
  },
  {
    "slug": "coin-change-dp",
    "title": "Coin Change",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/coin-change/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "TSS Consultancy algorithmic problem solving round.",
    "statement": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    "constraints": "1 <= coins.length <= 12, 1 <= coins[i] <= 2^31 - 1, 0 <= amount <= 10^4",
    "examples": [
      {
        "input": "coins = [1, 2, 5], amount = 11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1 (3 coins)."
      }
    ]
  },
  {
    "slug": "longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "category": "General Programming",
    "topic": "",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "externalUrl": "https://leetcode.com/problems/longest-common-subsequence/",
    "companyTags": [
      "TSS Consultancy Private Limited"
    ],
    "companyTagSource": "company-pattern",
    "interviewContext": "DP string pattern matching question asked in TSS advanced round.",
    "statement": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    "constraints": "1 <= text1.length, text2.length <= 1000",
    "examples": [
      {
        "input": "text1 = \"abcde\", text2 = \"ace\"",
        "output": "3",
        "explanation": "The longest common subsequence is \"ace\" and its length is 3."
      }
    ]
  }
];

async function seed() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GECRPlacement Coding Directory Seeder');
  console.log(`  Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'} | Questions: ${QUESTIONS.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (isDryRun) {
    console.log(`Validated: ${QUESTIONS.length} questions ready with verified external URLs.`);
    return;
  }

  await connectDB();

  const report = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const RANK = { Easy: 1, Medium: 2, Hard: 3 };

  for (const q of QUESTIONS) {
    try {
      q.difficultyRank = RANK[q.difficulty] || 1;
      q.isPublished = true;

      const result = await CodingQuestion.findOneAndUpdate(
        { slug: q.slug },
        { $set: q },
        { upsert: true, new: true, includeResultMetadata: true }
      );

      if (result.lastErrorObject?.updatedExisting) {
        report.updated++;
        process.stdout.write(`↑ updated: ${q.slug}\n`);
      } else {
        report.inserted++;
        process.stdout.write(`+ inserted: ${q.slug}\n`);
      }
    } catch (err) {
      report.skipped++;
      report.errors.push({ slug: q.slug, error: err.message });
      console.error(`✗ ERROR ${q.slug}: ${err.message}`);
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('  DIRECTORY SEED REPORT');
  console.log('─────────────────────────────────────────────');
  console.log(`  Total in file  : ${QUESTIONS.length}`);
  console.log(`  Inserted       : ${report.inserted}`);
  console.log(`  Updated        : ${report.updated}`);
  console.log(`  Skipped/Error  : ${report.skipped}`);
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
