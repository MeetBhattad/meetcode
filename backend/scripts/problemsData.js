// backend/scripts/problemsData.js
module.exports = [
  {
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nYou can return the answer in any order.",
    difficulty: "easy",
    tags: "array",
    visibleTestCases: [
      { input: "2 7 11 15\n9", output: "0 1", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "3 2 4\n6", output: "1 2", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." }
    ],
    hiddenTestCases: [
      { input: "3 3\n6", output: "0 1" },
      { input: "-3 4 3 90\n0", output: "0 2" },
      { input: "0 4 3 0\n0", output: "0 3" }
    ],
    startCode: [
      { language: "C++", initialCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}" },
      { language: "Java", initialCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        // Your code here\n    }\n}" },
      { language: "Python", initialCode: "import sys\n\ndef main():\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    main()" }
    ],
    referenceSolution: [
      { 
        language: "C++", 
        completeCode: "#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    stringstream ss(line);\n    vector<int> nums;\n    int x;\n    while (ss >> x) nums.push_back(x);\n    int target;\n    cin >> target;\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (mp.count(diff)) {\n            cout << mp[diff] << \" \" << i << endl;\n            return 0;\n        }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}" 
      },
      { 
        language: "Java", 
        completeCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String[] numsStr = br.readLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[numsStr.length];\n        for (int i = 0; i < numsStr.length; i++) {\n            nums[i] = Integer.parseInt(numsStr[i]);\n        }\n        int target = Integer.parseInt(br.readLine().trim());\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                System.out.println(map.get(diff) + \" \" + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}" 
      },
      { 
        language: "Python", 
        completeCode: "import sys\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        return\n    target = int(input_data[-1])\n    nums = [int(x) for x in input_data[:-1]]\n    num_map = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in num_map:\n            print(f\"{num_map[diff]} {i}\")\n            return\n        num_map[num] = i\n\nif __name__ == '__main__':\n    main()" 
      }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
    difficulty: "easy",
    tags: "stack",
    visibleTestCases: [
      { input: "()", output: "true", explanation: "The string is valid." },
      { input: "()[]{}", output: "true", explanation: "All brackets are closed properly." },
      { input: "(]", output: "false", explanation: "Mismatched brackets." }
    ],
    hiddenTestCases: [
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" }
    ],
    startCode: [
      { language: "C++", initialCode: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}" },
      { language: "Java", initialCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        // Your code here\n    }\n}" },
      { language: "Python", initialCode: "import sys\n\ndef main():\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    main()" }
    ],
    referenceSolution: [
      { 
        language: "C++", 
        completeCode: "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else {\n            if (st.empty()) { cout << \"false\" << endl; return 0; }\n            char top = st.top(); st.pop();\n            if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) {\n                cout << \"false\" << endl; return 0;\n            }\n        }\n    }\n    cout << (st.empty() ? \"true\" : \"false\") << endl;\n    return 0;\n}" 
      },
      { 
        language: "Java", 
        completeCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine().trim();\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '[' || c == '{') stack.push(c);\n            else {\n                if (stack.isEmpty()) { System.out.println(\"false\"); return; }\n                char top = stack.pop();\n                if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) {\n                    System.out.println(\"false\"); return;\n                }\n            }\n        }\n        System.out.println(stack.isEmpty() ? \"true\" : \"false\");\n    }\n}" 
      },
      { 
        language: "Python", 
        completeCode: "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    stack = []\n    mapping = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                print(\"false\")\n                return\n        else:\n            stack.append(char)\n    print(\"true\" if not stack else \"false\")\n\nif __name__ == '__main__':\n    main()" 
      }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.\n\n**Note for this platform:** Instead of linked lists, the input will be provided as two space-separated sorted arrays on separate lines. Output the merged sorted array as a single space-separated string.",
    difficulty: "easy",
    tags: "linkedList",
    visibleTestCases: [
      { input: "1 2 4\n1 3 4", output: "1 1 2 3 4 4", explanation: "Merging the two arrays yields the sorted array." },
      { input: "\n0", output: "0", explanation: "One array is empty, the other has 0." }
    ],
    hiddenTestCases: [
      { input: "5\n1 2 3", output: "1 2 3 5" },
      { input: "1 1 1\n1 1 1", output: "1 1 1 1 1 1" }
    ],
    startCode: [
      { language: "C++", initialCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}" },
      { language: "Java", initialCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        // Your code here\n    }\n}" },
      { language: "Python", initialCode: "import sys\n\ndef main():\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    main()" }
    ],
    referenceSolution: [
      { 
        language: "C++", 
        completeCode: "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string line1, line2;\n    getline(cin, line1);\n    getline(cin, line2);\n    vector<int> nums;\n    stringstream ss1(line1), ss2(line2);\n    int x;\n    while (ss1 >> x) nums.push_back(x);\n    while (ss2 >> x) nums.push_back(x);\n    sort(nums.begin(), nums.end());\n    for (int i = 0; i < nums.size(); i++) {\n        cout << nums[i] << (i == nums.size() - 1 ? \"\" : \" \");\n    }\n    cout << endl;\n    return 0;\n}" 
      },
      { 
        language: "Java", 
        completeCode: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        List<Integer> nums = new ArrayList<>();\n        if (line1 != null && !line1.trim().isEmpty()) {\n            for (String s : line1.trim().split(\"\\\\s+\")) nums.add(Integer.parseInt(s));\n        }\n        if (line2 != null && !line2.trim().isEmpty()) {\n            for (String s : line2.trim().split(\"\\\\s+\")) nums.add(Integer.parseInt(s));\n        }\n        Collections.sort(nums);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.size(); i++) {\n            sb.append(nums.get(i));\n            if (i < nums.size() - 1) sb.append(\" \");\n        }\n        System.out.println(sb.toString());\n    }\n}" 
      },
      { 
        language: "Python", 
        completeCode: "import sys\n\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    nums = []\n    if len(lines) > 0 and lines[0].strip():\n        nums.extend([int(x) for x in lines[0].split()])\n    if len(lines) > 1 and lines[1].strip():\n        nums.extend([int(x) for x in lines[1].split()])\n    nums.sort()\n    print(' '.join(map(str, nums)))\n\nif __name__ == '__main__':\n    main()" 
      }
    ]
  }
];