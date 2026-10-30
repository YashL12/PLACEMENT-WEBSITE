/**
 * High-yield authentic coding and SQL questions expansion script.
 * Every question has an authentic, verified destination URL on LeetCode, HackerRank, GeeksforGeeks, or SQL-Practice.
 *
 * Usage:
 *   node scripts/expand-questions-dataset.js
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const CodingQuestion = require('../src/models/CodingQuestion');

const RANK = { Easy: 1, Medium: 2, Hard: 3 };

const VERIFIED_EXPANSION_QUESTIONS = [
  // ─── DSA: Arrays & Two Pointers ──────────────────────────────────────────
  {
    slug: 'two-sum',
    title: 'Two Sum',
    category: 'DSA',
    topic: 'Arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/two-sum/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Gateway Group'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Reported in initial online assessment and technical screening at TatvaSoft and eSparkBiz.',
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: 'nums[0] + nums[1] == 6.' }
    ]
  },
  {
    slug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    category: 'DSA',
    topic: 'Arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    companyTags: ['Kevit Technologies', 'TSS Consultancy Private Limited'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Frequently asked Kadane-style one-pass problem in GECR campus technical interviews.',
    statement: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    constraints: '1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' }
    ]
  },
  {
    slug: 'maximum-subarray-kadane',
    title: 'Maximum Subarray (Kadane Algorithm)',
    category: 'DSA',
    topic: 'Arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/maximum-subarray/',
    companyTags: ['RKIT Software Pvt Ltd', 'eInfochips'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Standard algorithmic round question asked to check optimal O(n) thinking instead of brute force.',
    statement: 'Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.',
    constraints: '1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'The subarray [1] has the largest sum 1.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.' }
    ]
  },
  {
    slug: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    category: 'DSA',
    topic: 'Arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    companyTags: ['TatvaSoft', 'Improwised Technologies'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Prefix sum hashmap technique problem popular in tech interviews.',
    statement: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
    constraints: '1 <= nums.length <= 2 * 10^4, -1000 <= nums[i] <= 1000, -10^7 <= k <= 10^7',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2', explanation: 'Subarrays [1,1] at indices 0-1 and 1-2.' },
      { input: 'nums = [1,2,3], k = 3', output: '2', explanation: 'Subarrays [1,2] and [3].' }
    ]
  },
  {
    slug: '3sum-triplets',
    title: '3Sum',
    category: 'DSA',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/3sum/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Sorting + Two pointers classic asked in multi-round technical interviews.',
    statement: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
    constraints: '3 <= nums.length <= 3000, -10^5 <= nums[i] <= 10^5',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Distinct triplets summing to zero.' }
    ]
  },
  {
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    category: 'DSA',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/container-with-most-water/',
    companyTags: ['Gateway Group', 'Silver Touch Technologies'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Two pointer greedy contraction problem.',
    statement: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
    constraints: 'n == height.length, 2 <= n <= 10^5, 0 <= height[i] <= 10^4',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area is between index 1 and index 8 with height 7 and width 7 = 49.' }
    ]
  },
  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    category: 'DSA',
    topic: 'Two Pointers',
    difficulty: 'Hard',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    companyTags: ['Zeus Learning', 'eInfochips'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Advanced two pointer / monotonic stack problem for high-tier placement roles.',
    statement: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: 'n == height.length, 1 <= n <= 2 * 10^4, 0 <= height[i] <= 10^5',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'Total 6 units of rain water are trapped.' }
    ]
  },
  {
    slug: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    category: 'DSA',
    topic: 'Arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    companyTags: ['Kevit Technologies', 'TatvaSoft'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Prefix and suffix product problem without division operator.',
    statement: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.',
    constraints: '2 <= nums.length <= 10^5, -30 <= nums[i] <= 30',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: '24 = 2*3*4, 12 = 1*3*4, 8 = 1*2*4, 6 = 1*2*3.' }
    ]
  },
  {
    slug: 'sort-colors-dnf',
    title: 'Sort Colors (Dutch National Flag)',
    category: 'DSA',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/sort-colors/',
    companyTags: ['eSparkBiz', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Three-way partitioning (0, 1, 2) in single pass.',
    statement: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue. We use integers 0, 1, and 2 to represent red, white, and blue, respectively. Must solve without library sort and in O(1) extra space.',
    constraints: 'n == nums.length, 1 <= n <= 300, nums[i] is either 0, 1, or 2.',
    examples: [
      { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]', explanation: 'In-place sorted colors.' }
    ]
  },
  {
    slug: 'spiral-matrix',
    title: 'Spiral Matrix',
    category: 'DSA',
    topic: 'Matrices',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/spiral-matrix/',
    companyTags: ['GN Websoft', 'RKIT Software Pvt Ltd'],
    companyTagSource: 'verified-pyq',
    interviewContext: '2D matrix boundary tracking problem popular in coding exams.',
    statement: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
    constraints: 'm == matrix.length, n == matrix[i].length, 1 <= m, n <= 10, -100 <= matrix[i][j] <= 100',
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]', explanation: 'Traverse clockwise from outer boundary inwards.' }
    ]
  },

  // ─── DSA: Strings & Sliding Window ───────────────────────────────────────
  {
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    category: 'DSA',
    topic: 'Strings',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/valid-anagram/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Version Systems'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Frequency counting on 26 lowercase English letters.',
    statement: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    constraints: '1 <= s.length, t.length <= 5 * 10^4, s and t consist of lowercase English letters.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Both strings have identical character counts.' },
      { input: 's = "rat", t = "car"', output: 'false', explanation: 'Character frequencies mismatch.' }
    ]
  },
  {
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    category: 'DSA',
    topic: 'Two Pointers',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/valid-palindrome/',
    companyTags: ['Kevit Technologies', 'TSS Consultancy Private Limited'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Two pointer inward walk ignoring non-alphanumeric characters.',
    statement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.',
    constraints: '1 <= s.length <= 2 * 10^5, s consists only of printable ASCII characters.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
    ]
  },
  {
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    category: 'DSA',
    topic: 'Sliding Window',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    companyTags: ['TSS Consultancy Private Limited', 'TatvaSoft', 'Zeus Learning'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Classic sliding window with set/map lookup.',
    statement: 'Given a string s, find the length of the longest substring without duplicate characters.',
    constraints: '0 <= s.length <= 5 * 10^4, s consists of English letters, digits, symbols and spaces.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length of 1.' }
    ]
  },
  {
    slug: 'group-anagrams',
    title: 'Group Anagrams',
    category: 'DSA',
    topic: 'Hashing',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/group-anagrams/',
    companyTags: ['eSparkBiz', 'Gateway Group'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Categorizing words by sorted string or tuple frequency key.',
    statement: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
    constraints: '1 <= strs.length <= 10^4, 0 <= strs[i].length <= 100, strs[i] consists of lowercase English letters.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Grouped by identical character components.' }
    ]
  },
  {
    slug: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    category: 'DSA',
    topic: 'Strings',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
    companyTags: ['Improwised Technologies', 'Zeus Learning'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Expand around center approach or dynamic programming.',
    statement: 'Given a string s, return the longest palindromic substring in s.',
    constraints: '1 <= s.length <= 1000, s consist of only digits and English letters.',
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"', explanation: '"bb" is the longest palindromic substring.' }
    ]
  },

  // ─── DSA: Linked Lists ───────────────────────────────────────────────────
  {
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'DSA',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    companyTags: ['Kevit Technologies', 'TatvaSoft', 'eSparkBiz'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'The fundamental pointer manipulation question asked in virtually every campus drive.',
    statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    constraints: 'The number of nodes in the list is the range [0, 5000]. -5000 <= Node.val <= 5000',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Pointers reversed in-place.' },
      { input: 'head = [1,2]', output: '[2,1]', explanation: 'Head points to 2, 2 points to 1.' }
    ]
  },
  {
    slug: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'DSA',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    companyTags: ['RKIT Software Pvt Ltd', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Merge step of merge sort applied to linked lists.',
    statement: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
    constraints: 'The number of nodes in both lists is in the range [0, 50]. -100 <= Node.val <= 100',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged in non-decreasing order.' }
    ]
  },
  {
    slug: 'linked-list-cycle',
    title: 'Linked List Cycle (Floyd Detection)',
    category: 'DSA',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/linked-list-cycle/',
    companyTags: ['TSS Consultancy Private Limited', 'Gateway Group'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Tortoise and Hare fast/slow pointer technique.',
    statement: 'Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Return true if there is a cycle in the linked list. Otherwise, return false.',
    constraints: 'The number of the nodes in the list is in the range [0, 10^4]. -10^5 <= Node.val <= 10^5',
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle where tail connects to the 1st node (0-indexed).' }
    ]
  },
  {
    slug: 'remove-nth-node-from-end-of-list',
    title: 'Remove Nth Node From End of List',
    category: 'DSA',
    topic: 'Linked Lists',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    companyTags: ['TatvaSoft', 'eInfochips'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Two pointer lead-lag technique to delete node in one pass.',
    statement: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
    constraints: 'The number of nodes in the list is sz. 1 <= sz <= 30. 0 <= Node.val <= 100. 1 <= n <= sz.',
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', explanation: 'Removes 4, which is the 2nd node from end.' }
    ]
  },
  {
    slug: 'middle-of-the-linked-list',
    title: 'Middle of the Linked List',
    category: 'DSA',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/',
    companyTags: ['Kevit Technologies', 'GN Websoft'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Classic fast/slow pointer problem asked in 1st round technical.',
    statement: 'Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.',
    constraints: 'The number of nodes in the list is in the range [1, 100]. 1 <= Node.val <= 100',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[3,4,5]', explanation: 'The middle node of the list is node 3.' }
    ]
  },

  // ─── DSA: Stacks and Queues ──────────────────────────────────────────────
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'DSA',
    topic: 'Stacks and Queues',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/valid-parentheses/',
    companyTags: ['TatvaSoft', 'Kevit Technologies', 'eSparkBiz', 'RKIT Software Pvt Ltd'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'One of the most frequently asked problems across all recruitment drives.',
    statement: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order. Every close bracket has a corresponding open bracket of the same type.',
    constraints: '1 <= s.length <= 10^4, s consists of parentheses only "()[]{}"',
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Properly matched pair.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All bracket pairs match.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
    ]
  },
  {
    slug: 'min-stack',
    title: 'Min Stack',
    category: 'DSA',
    topic: 'Stacks and Queues',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/min-stack/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Testing auxiliary stack / value encoding for O(1) minimum retrieval.',
    statement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class: MinStack() initializes the stack object. void push(int val) pushes the element val onto the stack. void pop() removes the element on the top of the stack. int top() gets the top element. int getMin() retrieves the minimum element in the stack. You must implement a solution with O(1) time complexity for each function.',
    constraints: '-2^31 <= val <= 2^31 - 1. Methods pop, top and getMin operations will always be called on non-empty stacks. At most 3 * 10^4 calls will be made.',
    examples: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"] [[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]', explanation: 'MinStack maintains running minimum in O(1).' }
    ]
  },
  {
    slug: 'daily-temperatures',
    title: 'Daily Temperatures',
    category: 'DSA',
    topic: 'Stacks and Queues',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/daily-temperatures/',
    companyTags: ['Improwised Technologies', 'Gateway Group'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Monotonic decreasing stack pattern.',
    statement: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.',
    constraints: '1 <= temperatures.length <= 10^5, 30 <= temperatures[i] <= 100',
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]', explanation: 'Calculated using indices on monotonic stack.' }
    ]
  },
  {
    slug: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    category: 'DSA',
    topic: 'Stacks and Queues',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/',
    companyTags: ['Kevit Technologies', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Standard amortized O(1) two-stack interview question.',
    statement: 'Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).',
    constraints: '1 <= x <= 9. At most 100 calls will be made to push, pop, peek, and empty.',
    examples: [
      { input: '["MyQueue", "push", "push", "peek", "pop", "empty"] [[], [1], [2], [], [], []]', output: '[null, null, null, 1, 1, false]', explanation: 'Pops in FIFO order using input and output stacks.' }
    ]
  },

  // ─── DSA: Trees and BST ──────────────────────────────────────────────────
  {
    slug: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'DSA',
    topic: 'Trees',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Kevit Technologies'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Canonical recursive tree traversal asking to swap left and right subtrees.',
    statement: 'Given the root of a binary tree, invert the tree, and return its root.',
    constraints: 'The number of nodes in the tree is in the range [0, 100]. -100 <= Node.val <= 100',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Every left and right child is mirrored.' }
    ]
  },
  {
    slug: 'maximum-depth-of-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    category: 'DSA',
    topic: 'Trees',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    companyTags: ['RKIT Software Pvt Ltd', 'Version Systems'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Recursive tree height calculation.',
    statement: 'Given the root of a binary tree, return its maximum depth. A binary tree maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    constraints: 'The number of nodes in the tree is in the range [0, 10^4]. -100 <= Node.val <= 100',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'Root to 15 or 7 gives length 3.' }
    ]
  },
  {
    slug: 'lowest-common-ancestor-of-a-bst',
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    category: 'DSA',
    topic: 'Trees',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Utilizing BST ordering property to find split point.',
    statement: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. According to the definition of LCA on Wikipedia: The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants.',
    constraints: 'The number of nodes in the tree is in the range [2, 10^5]. All Node.val are unique.',
    examples: [
      { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6', explanation: 'The LCA of nodes 2 and 8 is 6.' }
    ]
  },
  {
    slug: 'binary-tree-level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    category: 'DSA',
    topic: 'Trees',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    companyTags: ['TatvaSoft', 'eInfochips'],
    companyTagSource: 'company-pattern',
    interviewContext: 'BFS traversal using queue level by level.',
    statement: 'Given the root of a binary tree, return the level order traversal of its nodes values. (i.e., from left to right, level by level).',
    constraints: 'The number of nodes in the tree is in the range [0, 2000]. -1000 <= Node.val <= 1000',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Grouped by level.' }
    ]
  },
  {
    slug: 'validate-binary-search-tree',
    title: 'Validate Binary Search Tree',
    category: 'DSA',
    topic: 'Trees',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
    companyTags: ['Gateway Group', 'Silver Touch Technologies'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Boundary checking (low, high) or inorder traversal strictly increasing check.',
    statement: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys strictly less than the node key. The right subtree contains only nodes with keys strictly greater than the node key. Both the left and right subtrees must also be binary search trees.',
    constraints: 'The number of nodes in the tree is in the range [1, 10^4]. -2^31 <= Node.val <= 2^31 - 1',
    examples: [
      { input: 'root = [2,1,3]', output: 'true', explanation: 'Valid BST structure.' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'Root is 5, but right child has value 4.' }
    ]
  },

  // ─── DSA: Graphs ─────────────────────────────────────────────────────────
  {
    slug: 'number-of-islands',
    title: 'Number of Islands',
    category: 'DSA',
    topic: 'Graphs',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/number-of-islands/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning', 'TatvaSoft'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Grid DFS/BFS connected components problem.',
    statement: 'Given an m x n 2D binary grid grid which represents a map of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
    constraints: 'm == grid.length, n == grid[i].length, 1 <= m, n <= 300, grid[i][j] is "0" or "1".',
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', explanation: 'All 1s connect into a single island.' }
    ]
  },
  {
    slug: 'rotting-oranges',
    title: 'Rotting Oranges',
    category: 'DSA',
    topic: 'Graphs',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/rotting-oranges/',
    companyTags: ['Improwised Technologies', 'eInfochips'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Multi-source BFS traversal problem.',
    statement: 'You are given an m x n grid where each cell can have one of three values: 0 representing an empty cell, 1 representing a fresh orange, or 2 representing a rotten orange. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.',
    constraints: 'm == grid.length, n == grid[i].length, 1 <= m, n <= 10, grid[i][j] is 0, 1, or 2.',
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4', explanation: 'Oranges rot simultaneously layer by layer.' }
    ]
  },
  {
    slug: 'course-schedule',
    title: 'Course Schedule (Cycle in Directed Graph)',
    category: 'DSA',
    topic: 'Graphs',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/course-schedule/',
    companyTags: ['Zeus Learning', 'TSS Consultancy Private Limited'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Kahn Algorithm / Topological sorting using in-degrees.',
    statement: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.',
    constraints: '1 <= numCourses <= 2000, 0 <= prerequisites.length <= 5000',
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Can finish: take 0 then 1.' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'Circular prerequisite dependency.' }
    ]
  },

  // ─── DSA: Dynamic Programming ────────────────────────────────────────────
  {
    slug: 'house-robber',
    title: 'House Robber',
    category: 'DSA',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/house-robber/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Kevit Technologies'],
    companyTagSource: 'verified-pyq',
    interviewContext: '1D DP decision choice: rob current house + dp[i-2] vs skip current house (dp[i-1]).',
    statement: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Return the maximum amount of money you can rob tonight without alerting the police.',
    constraints: '1 <= nums.length <= 100, 0 <= nums[i] <= 400',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 12.' }
    ]
  },
  {
    slug: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    category: 'DSA',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'company-pattern',
    interviewContext: 'O(n^2) DP or O(n log n) with patience sorting/binary search.',
    statement: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.',
    constraints: '1 <= nums.length <= 2500, -10^4 <= nums[i] <= 10^4',
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' }
    ]
  },
  {
    slug: 'unique-paths',
    title: 'Unique Paths',
    category: 'DSA',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/unique-paths/',
    companyTags: ['eSparkBiz', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Grid 2D DP transition dp[i][j] = dp[i-1][j] + dp[i][j-1].',
    statement: 'There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.',
    constraints: '1 <= m, n <= 100',
    examples: [
      { input: 'm = 3, n = 7', output: '28', explanation: 'Total 28 unique ways to navigate 3x7 grid.' },
      { input: 'm = 3, n = 2', output: '3', explanation: '1. Right -> Down -> Down, 2. Down -> Down -> Right, 3. Down -> Right -> Down.' }
    ]
  },

  // ─── DSA: Backtracking ───────────────────────────────────────────────────
  {
    slug: 'subsets',
    title: 'Subsets (Power Set)',
    category: 'DSA',
    topic: 'Recursion and Backtracking',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/subsets/',
    companyTags: ['Kevit Technologies', 'TatvaSoft'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Include/exclude backtracking or bitmask approach.',
    statement: 'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.',
    constraints: '1 <= nums.length <= 10, -10 <= nums[i] <= 10, All elements are unique.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', explanation: 'All 2^n subsets.' }
    ]
  },
  {
    slug: 'combination-sum',
    title: 'Combination Sum',
    category: 'DSA',
    topic: 'Recursion and Backtracking',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/combination-sum/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Unbounded backtracking choice problem.',
    statement: 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order. The same number may be chosen from candidates an unlimited number of times.',
    constraints: '1 <= candidates.length <= 30, 2 <= candidates[i] <= 40, All elements distinct. 1 <= target <= 40',
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]', explanation: '2 and 3 can be chosen multiple times.' }
    ]
  },
  {
    slug: 'word-search',
    title: 'Word Search',
    category: 'DSA',
    topic: 'Recursion and Backtracking',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/word-search/',
    companyTags: ['Improwised Technologies', 'Gateway Group'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Grid DFS with in-place cell marking and backtracking restore.',
    statement: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
    constraints: 'm == board.length, n = board[i].length, 1 <= m, n <= 6, 1 <= word.length <= 15',
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: 'Word path found across adjacent cells.' }
    ]
  },

  // ─── DSA: Binary Search ──────────────────────────────────────────────────
  {
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    category: 'DSA',
    topic: 'Binary Search',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'TSS Consultancy Private Limited'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Determining which half of array is strictly sorted in O(log n).',
    statement: 'There is an integer array nums sorted in ascending order (with distinct values). Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.',
    constraints: '1 <= nums.length <= 5000, -10^4 <= nums[i] <= 10^4, -10^4 <= target <= 10^4',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: 'Target 0 found at index 4.' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: 'Target 3 not present in array.' }
    ]
  },

  // ─── DSA: Heaps & Priority Queues ────────────────────────────────────────
  {
    slug: 'kth-largest-element-in-an-array',
    title: 'Kth Largest Element in an Array',
    category: 'DSA',
    topic: 'Heaps and Priority Queues',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    companyTags: ['Kevit Technologies', 'RKIT Software Pvt Ltd'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Min-heap of size K or QuickSelect partitioning algorithm.',
    statement: 'Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element. Can you solve it without sorting?',
    constraints: '1 <= k <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4',
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'Sorted order is [1,2,3,4,5,6], 2nd largest is 5.' }
    ]
  },
  {
    slug: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    category: 'DSA',
    topic: 'Heaps and Priority Queues',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
    companyTags: ['eSparkBiz', 'TatvaSoft'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Bucket sort or min-heap on frequency map.',
    statement: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
    constraints: '1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4, k is in the range [1, the number of unique elements in the array].',
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explanation: '1 occurs three times, 2 occurs twice.' }
    ]
  },

  // ─── DSA: Bit Manipulation ───────────────────────────────────────────────
  {
    slug: 'single-number',
    title: 'Single Number (XOR Property)',
    category: 'DSA',
    topic: 'Bit Manipulation',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/single-number/',
    companyTags: ['TatvaSoft', 'GN Websoft', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Using x ^ x = 0 property to identify unique number in O(n) time and O(1) space.',
    statement: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
    constraints: '1 <= nums.length <= 3 * 10^4, -3 * 10^4 <= nums[i] <= 3 * 10^4',
    examples: [
      { input: 'nums = [2,2,1]', output: '1', explanation: '2 XOR 2 = 0, leaving 1.' },
      { input: 'nums = [4,1,2,1,2]', output: '4', explanation: 'All duplicate pairs cancel out, leaving 4.' }
    ]
  },
  {
    slug: 'number-of-1-bits',
    title: 'Number of 1 Bits (Hamming Weight)',
    category: 'DSA',
    topic: 'Bit Manipulation',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/number-of-1-bits/',
    companyTags: ['Version Systems', 'eInfochips'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Brian Kernighan bit clearing trick n & (n - 1).',
    statement: 'Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).',
    constraints: '1 <= n <= 2^31 - 1',
    examples: [
      { input: 'n = 11', output: '3', explanation: 'The input binary string 1011 has a total of three set bits.' },
      { input: 'n = 128', output: '1', explanation: '128 is 10000000 in binary, total 1 set bit.' }
    ]
  },

  // ─── DSA: Tries ──────────────────────────────────────────────────────────
  {
    slug: 'implement-trie-prefix-tree',
    title: 'Implement Trie (Prefix Tree)',
    category: 'DSA',
    topic: 'Tries',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    companyTags: ['Zeus Learning', 'Improwised Technologies'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Prefix tree data structure design with insert, search, and startsWith methods.',
    statement: 'A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class: Trie() initializes the trie object. void insert(String word) inserts the string word into the trie. boolean search(String word) returns true if the string word is in the trie. boolean startsWith(String prefix) returns true if there is a previously inserted string word that has the prefix prefix.',
    constraints: '1 <= word.length, prefix.length <= 2000. word and prefix consist only of lowercase English letters.',
    examples: [
      { input: '["Trie", "insert", "search", "search", "startsWith", "insert", "search"] [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]', output: '[null, null, true, false, true, null, true]', explanation: 'Prefix matching with O(L) time per query.' }
    ]
  },

  // ─── SQL: LeetCode & HackerRank Verified ──────────────────────────────────
  {
    slug: 'sql-second-highest-salary',
    title: 'Second Highest Salary',
    category: 'SQL',
    topic: 'Subqueries',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/second-highest-salary/',
    companyTags: ['Kevit Technologies', 'TatvaSoft', 'TSS Consultancy Private Limited'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Very frequent SQL interview question. Tests NULL handling when table has fewer than 2 distinct salaries.',
    statement: 'Write a solution to find the second highest distinct salary from the Employee table. If there is no second highest salary, return null (return None in Pandas). Table Employee: id (int), salary (int).',
    constraints: 'id is the primary key column for Employee table.',
    examples: [
      { input: 'Employee = [[1, 100], [2, 200], [3, 300]]', output: '{"SecondHighestSalary": 200}', explanation: '200 is the second highest distinct salary.' },
      { input: 'Employee = [[1, 100]]', output: '{"SecondHighestSalary": null}', explanation: 'Only 1 salary exists, returns NULL.' }
    ]
  },
  {
    slug: 'sql-department-highest-salary',
    title: 'Department Highest Salary',
    category: 'SQL',
    topic: 'Joins',
    difficulty: 'Medium',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/department-highest-salary/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Gateway Group'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Multi-table JOIN with correlated subquery or IN clause on (departmentId, salary).',
    statement: 'Write a solution to find employees who have the highest salary in each of the departments. Return the result table in any order. Tables: Employee (id, name, salary, departmentId), Department (id, name).',
    constraints: 'departmentId is a foreign key to id in the Department table.',
    examples: [
      { input: 'Employee = [[1,"Joe",70000,1],[2,"Jim",90000,1],[3,"Henry",80000,2],[4,"Sam",60000,2],[5,"Max",90000,1]], Department = [[1,"IT"],[2,"Sales"]]', output: '[{"Department":"IT","Employee":"Jim","Salary":90000},{"Department":"IT","Employee":"Max","Salary":90000},{"Department":"Sales","Employee":"Henry","Salary":80000}]', explanation: 'Tied highest salaries are both included.' }
    ]
  },
  {
    slug: 'sql-delete-duplicate-emails',
    title: 'Delete Duplicate Emails',
    category: 'SQL',
    topic: 'Data Modification',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/delete-duplicate-emails/',
    companyTags: ['RKIT Software Pvt Ltd', 'Version Systems'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Tests self-join in DELETE statement: DELETE p1 FROM Person p1, Person p2 WHERE p1.email = p2.email AND p1.id > p2.id.',
    statement: 'Write a solution to delete all duplicate emails, keeping only one unique email with the smallest id. For SQL users, please note that you are supposed to write a DELETE statement and not a SELECT one. Table: Person (id, email).',
    constraints: 'id is the primary key column for this table. Each row contains an email.',
    examples: [
      { input: 'Person = [[1,"john@example.com"],[2,"bob@example.com"],[3,"john@example.com"]]', output: 'Person = [[1,"john@example.com"],[2,"bob@example.com"]]', explanation: 'john@example.com is repeated; row 3 is deleted because its id is larger.' }
    ]
  },
  {
    slug: 'sql-rising-temperature',
    title: 'Rising Temperature',
    category: 'SQL',
    topic: 'Date and Time Queries',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/rising-temperature/',
    companyTags: ['Kevit Technologies', 'TSS Consultancy Private Limited'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Tests DATEDIFF() function to find consecutive days with higher temperatures.',
    statement: 'Write a solution to find all dates id with higher temperatures compared to its previous dates (yesterday). Return the result table in any order. Table: Weather (id, recordDate, temperature).',
    constraints: 'id is the column with unique values for this table. There are no different rows with the same recordDate.',
    examples: [
      { input: 'Weather = [[1,"2015-01-01",10],[2,"2015-01-02",25],[3,"2015-01-03",20],[4,"2015-01-04",30]]', output: '[{"id":2},{"id":4}]', explanation: 'In 2015-01-02 the temperature was higher than yesterday (10 -> 25). In 2015-01-04 it was higher than yesterday (20 -> 30).' }
    ]
  },
  {
    slug: 'sql-employees-earning-more-than-managers',
    title: 'Employees Earning More Than Their Managers',
    category: 'SQL',
    topic: 'Joins',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/employees-earning-more-than-their-managers/',
    companyTags: ['TatvaSoft', 'eSparkBiz', 'Prominent Pixel'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'Self-join testing: JOIN Employee e ON e.managerId = m.id WHERE e.salary > m.salary.',
    statement: 'Write a solution to find the employees who earn more than their managers. Return the result table in any order. Table: Employee (id, name, salary, managerId).',
    constraints: 'managerId is the id of the manager for that employee.',
    examples: [
      { input: 'Employee = [[1,"Joe",70000,3],[2,"Henry",80000,4],[3,"Sam",60000,null],[4,"Max",90000,null]]', output: '[{"Employee":"Joe"}]', explanation: 'Joe is the only employee who earns more than his manager (Sam earns 60000).' }
    ]
  },
  {
    slug: 'sql-duplicate-emails',
    title: 'Duplicate Emails',
    category: 'SQL',
    topic: 'Duplicate Detection',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/duplicate-emails/',
    companyTags: ['GN Websoft', 'Silent Infotech'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'GROUP BY with HAVING COUNT(email) > 1.',
    statement: 'Write a solution to report all the duplicate emails. Note that it is guaranteed that the email field is not NULL. Return the result table in any order. Table: Person (id, email).',
    constraints: 'id is the primary key column for Person table.',
    examples: [
      { input: 'Person = [[1,"a@b.com"],[2,"c@d.com"],[3,"a@b.com"]]', output: '[{"Email":"a@b.com"}]', explanation: 'a@b.com appears twice in table.' }
    ]
  },
  {
    slug: 'sql-customers-who-never-order',
    title: 'Customers Who Never Order',
    category: 'SQL',
    topic: 'Joins',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/customers-who-never-order/',
    companyTags: ['Kevit Technologies', 'eSparkBiz'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'LEFT JOIN ... WHERE o.customerId IS NULL or NOT IN subquery.',
    statement: 'Write a solution to find all customers who never order anything. Return the result table in any order. Tables: Customers (id, name), Orders (id, customerId).',
    constraints: 'customerId is a foreign key of the ID from the Customers table.',
    examples: [
      { input: 'Customers = [[1,"Joe"],[2,"Henry"],[3,"Sam"],[4,"Max"]], Orders = [[1,3],[2,1]]', output: '[{"Customers":"Henry"},{"Customers":"Max"}]', explanation: 'Henry and Max never made an order.' }
    ]
  },
  {
    slug: 'sql-big-countries',
    title: 'Big Countries',
    category: 'SQL',
    topic: 'SELECT and Filtering',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/big-countries/',
    companyTags: ['TatvaSoft', 'RKIT Software Pvt Ltd'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'WHERE area >= 3000000 OR population >= 25000000.',
    statement: 'A country is big if it has an area of at least three million (i.e., 3000000 km2), or it has a population of at least twenty-five million (i.e., 25000000). Write a solution to find the name, population, and area of the big countries. Table: World (name, continent, area, population, gdp).',
    constraints: 'name is the primary key for World table.',
    examples: [
      { input: 'World = [["Afghanistan","Asia",652230,25500100,20343000],["Albania","Europe",28748,2831741,12960000]]', output: '[{"name":"Afghanistan","population":25500100,"area":652230}]', explanation: 'Afghanistan has population >= 25000000.' }
    ]
  },
  {
    slug: 'sql-classes-more-than-5-students',
    title: 'Classes More Than 5 Students',
    category: 'SQL',
    topic: 'GROUP BY and HAVING',
    difficulty: 'Easy',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/classes-more-than-5-students/',
    companyTags: ['Gateway Group', 'Version Systems'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'GROUP BY class HAVING COUNT(student) >= 5.',
    statement: 'Write a solution to find all the classes that have at least five students. Return the result table in any order. Table: Courses (student, class).',
    constraints: '(student, class) is the primary key for Courses table.',
    examples: [
      { input: 'Courses = [["A","Math"],["B","English"],["C","Math"],["D","Biology"],["E","Math"],["F","Computer"],["G","Math"],["H","Math"],["I","Math"]]', output: '[{"class":"Math"}]', explanation: 'Math has 6 students, which is >= 5.' }
    ]
  },
  {
    slug: 'sql-department-top-three-salaries',
    title: 'Department Top Three Salaries',
    category: 'SQL',
    topic: 'Window Functions',
    difficulty: 'Hard',
    platform: 'LeetCode',
    externalUrl: 'https://leetcode.com/problems/department-top-three-salaries/',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'company-pattern',
    interviewContext: 'DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) <= 3.',
    statement: 'A company executives are interested in seeing who earns the most money in each of the company departments. A high earner in a department is an employee who has a salary in the top three unique salaries for that department. Write a solution to find the employees who are high earners in each of the departments.',
    constraints: 'departmentId is a foreign key to id in Department table.',
    examples: [
      { input: 'Employee = [[1,"Joe",85000,1],[2,"Henry",80000,2],[3,"Sam",60000,2],[4,"Max",90000,1],[5,"Janet",69000,1],[6,"Randy",85000,1],[7,"Will",70000,1]], Department = [[1,"IT"],[2,"Sales"]]', output: '[{"Department":"IT","Employee":"Max","Salary":90000},{"Department":"IT","Employee":"Joe","Salary":85000},{"Department":"IT","Employee":"Randy","Salary":85000},{"Department":"IT","Employee":"Will","Salary":70000},{"Department":"Sales","Employee":"Henry","Salary":80000},{"Department":"Sales","Employee":"Sam","Salary":60000}]', explanation: 'Dense rank preserves top 3 distinct salaries.' }
    ]
  },
  {
    slug: 'sql-hackerrank-revising-select-query-1',
    title: 'Revising the Select Query I',
    category: 'SQL',
    topic: 'SELECT and Filtering',
    difficulty: 'Easy',
    platform: 'HackerRank',
    externalUrl: 'https://www.hackerrank.com/challenges/revising-the-select-query/problem',
    companyTags: ['eSparkBiz', 'TatvaSoft'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'HackerRank SQL challenge testing basic WHERE filter on CountryCode and Population.',
    statement: 'Query all columns for all American cities in the CITY table with populations larger than 100,000. The CountryCode for America is USA. Table: CITY (ID, NAME, COUNTRYCODE, DISTRICT, POPULATION).',
    constraints: 'POPULATION > 100000 AND COUNTRYCODE = "USA".',
    examples: [
      { input: 'CITY table with rows from various countries.', output: 'All matching American city records with population > 100,000.', explanation: 'SELECT * FROM CITY WHERE POPULATION > 100000 AND COUNTRYCODE = "USA";' }
    ]
  },
  {
    slug: 'sql-hackerrank-weather-station-5',
    title: 'Weather Observation Station 5 (Shortest & Longest City)',
    category: 'SQL',
    topic: 'SELECT and Filtering',
    difficulty: 'Easy',
    platform: 'HackerRank',
    externalUrl: 'https://www.hackerrank.com/challenges/weather-observation-station-5/problem',
    companyTags: ['Kevit Technologies', 'Gateway Group'],
    companyTagSource: 'verified-pyq',
    interviewContext: 'HackerRank SQL classic testing LENGTH() and ORDER BY with LIMIT.',
    statement: 'Query the two cities in STATION with the shortest and longest CITY names, as well as their respective lengths (i.e.: number of characters in the name). If there is more than one smallest or largest city, choose the one that comes first when ordered alphabetically. Table: STATION (ID, CITY, STATE, LAT_N, LONG_W).',
    constraints: 'CITY name lengths should be measured with LENGTH(). Result should have 2 rows.',
    examples: [
      { input: 'STATION table containing city names like "Amo" (length 3) and "Marine On Saint Croix" (length 21).', output: 'Amo 3\nMarine On Saint Croix 21', explanation: 'Shortest and longest alphabetically sorted first.' }
    ]
  },
  {
    slug: 'sql-hackerrank-the-report',
    title: 'The Report (Non-Equi Join)',
    category: 'SQL',
    topic: 'Joins',
    difficulty: 'Medium',
    platform: 'HackerRank',
    externalUrl: 'https://www.hackerrank.com/challenges/the-report/problem',
    companyTags: ['TSS Consultancy Private Limited', 'Zeus Learning'],
    companyTagSource: 'company-pattern',
    interviewContext: 'Tests non-equi join on grade ranges (Marks BETWEEN Min_Mark AND Max_Mark) and conditional CASE names.',
    statement: 'You are given two tables: Students (ID, Name, Marks) and Grades (Grade, Min_Mark, Max_Mark). Ketty gives Eve a task to generate a report containing three columns: Name, Grade and Mark. Ketty doesn\'t want the names of those students who received a grade lower than 8. The report must be in descending order by grade. If there is more than one student with the same grade (8-10) assigned to them, order those particular students by their name alphabetically. If the grade is lower than 8, use "NULL" as their name and list them by their marks in ascending order.',
    constraints: '1 <= Marks <= 100. Grades from 1 to 10.',
    examples: [
      { input: 'Students table + Grades boundary table', output: 'Formatted report sorted by Grade DESC, Name ASC / Marks ASC', explanation: 'Uses BETWEEN join with CASE statement for names.' }
    ]
  }
];

async function run() {
  await connectDB();
  console.log('MongoDB connected for questions dataset expansion.\n');

  // Step 1: Normalize any legacy General Programming category into DSA
  const gpUpdate = await CodingQuestion.updateMany(
    { category: 'General Programming' },
    { $set: { category: 'DSA' } }
  );
  console.log(`Updated ${gpUpdate.modifiedCount} legacy General Programming questions to category: DSA`);

  // Step 2: Normalize legacy singular topics into plural / standard topics
  const topicReplacements = [
    { from: 'Array', to: 'Arrays' },
    { from: 'String', to: 'Strings' },
    { from: 'Linked List', to: 'Linked Lists' },
    { from: 'Stack', to: 'Stacks and Queues' },
    { from: 'Queue', to: 'Stacks and Queues' },
    { from: 'Tree', to: 'Trees' },
    { from: 'Graph', to: 'Graphs' },
  ];

  for (const { from, to } of topicReplacements) {
    const res = await CodingQuestion.updateMany({ topic: from }, { $set: { topic: to } });
    if (res.modifiedCount > 0) {
      console.log(`Normalized topic "${from}" -> "${to}" on ${res.modifiedCount} questions.`);
    }
  }

  // Step 3: Insert / Upsert the verified expansion questions
  let inserted = 0;
  let updated = 0;

  for (const q of VERIFIED_EXPANSION_QUESTIONS) {
    q.difficultyRank = RANK[q.difficulty] || 1;
    q.isPublished = true;
    q.sortOrder = q.sortOrder || 10;

    const res = await CodingQuestion.updateOne(
      { slug: q.slug },
      { $set: q },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      inserted++;
      process.stdout.write(`+ Added: [${q.category}] ${q.title} (${q.platform})\n`);
    } else {
      updated++;
      process.stdout.write(`~ Updated: [${q.category}] ${q.title} (${q.platform})\n`);
    }
  }

  console.log(`\nExpansion completed: ${inserted} inserted, ${updated} updated.`);

  // Step 4: Summary Audit
  const total = await CodingQuestion.countDocuments({ isPublished: true });
  const dsaCount = await CodingQuestion.countDocuments({ isPublished: true, category: 'DSA' });
  const sqlCount = await CodingQuestion.countDocuments({ isPublished: true, category: 'SQL' });
  const platforms = await CodingQuestion.distinct('platform', { isPublished: true });
  const topics = await CodingQuestion.distinct('topic', { isPublished: true });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GECRPlacement Questions Database Status');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total Published Questions : ${total}`);
  console.log(`  DSA Questions             : ${dsaCount}`);
  console.log(`  SQL Questions             : ${sqlCount}`);
  console.log(`  Platforms                 : ${platforms.join(', ')}`);
  console.log(`  Active Topics             : ${topics.filter(Boolean).length}`);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Expansion failed:', err);
  process.exit(1);
});
