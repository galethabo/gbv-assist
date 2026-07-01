import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();
  const textInputRef = useRef();

  // Load messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return unsubscribe;
  }, []);

  // 🔹 Comprehensive GBV support bot reply generator
  const generateBotReply = (userMessage) => {
    const msg = userMessage.toLowerCase().trim();

    // Emergency situations
    if (msg.includes("emergency") || msg.includes("danger") || msg.includes("hurt") || 
        msg.includes("abuse") || msg.includes("violence") || msg.includes("attack") ||
        msg.includes("bleeding") || msg.includes("hospital") || msg.includes("police")) {
      return {
        text: "🚨 This sounds like an emergency situation. Your safety is the top priority. Please:\n\n• Call emergency services: 10111 (SA Police) or 10177 (Ambulance)\n• GBV Command Centre: 0800 428 428\n• If in immediate danger, try to get to a safe location\n\nWould you like me to provide more specific emergency contacts?",
        type: "emergency",
        resources: ["police", "ambulance", "gbv_hotline"]
      };
    }

    // Emotional support and mental health
    if (msg.includes("sad") || msg.includes("depressed") || msg.includes("unhappy") || 
        msg.includes("crying") || msg.includes("hopeless") || msg.includes("suicide") ||
        msg.includes("kill myself") || msg.includes("end it all")) {
      
      if (msg.includes("suicide") || msg.includes("kill myself") || msg.includes("end it all")) {
        return {
          text: "💙 Please know your life is precious and there is hope. \n\n• Suicide Crisis Line: 0800 567 567\n• SADAG Mental Health Line: 011 234 4837\n• Lifeline: 0861 322 322\n\nYou don't have to go through this alone. Please reach out to these numbers immediately.",
          type: "crisis",
          resources: ["suicide_hotline", "mental_health"]
        };
      }
      
      return {
        text: "I'm really sorry you're feeling this way. It takes courage to acknowledge these feelings. Remember:\n\n• Your feelings are valid\n• This pain is temporary\n• Professional help is available\n\nWould you like me to connect you with mental health resources?",
        type: "emotional_support",
        resources: ["mental_health"]
      };
    }

    // Stress and anxiety
    if (msg.includes("stress") || msg.includes("anxious") || msg.includes("worried") || 
        msg.includes("panic") || msg.includes("overwhelmed") || msg.includes("nervous")) {
      return {
        text: "Stress and anxiety can feel overwhelming. Here are some immediate coping strategies:\n\n• Breathe deeply: 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s)\n• Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste\n• Take a short walk if safe to do so\n\nWould you like more long-term coping strategies?",
        type: "anxiety_support",
        resources: ["coping_strategies"]
      };
    }

    // Legal help and rights
    if (msg.includes("legal") || msg.includes("lawyer") || msg.includes("court") || 
        msg.includes("rights") || msg.includes("protection order") || msg.includes("divorce") ||
        msg.includes("custody") || msg.includes("law")) {
      return {
        text: "Legal support is available for GBV survivors:\n\n• Legal Aid South Africa: 0800 110 110\n• Women's Legal Centre: 021 424 5660\n• You can apply for a protection order at any police station\n• Remember: You have the right to safety and legal protection\n\nWould you like specific information about protection orders?",
        type: "legal_support",
        resources: ["legal_aid", "protection_orders"]
      };
    }

    // Shelter and safe housing
    if (msg.includes("shelter") || msg.includes("safe house") || msg.includes("nowhere to go") || 
        msg.includes("homeless") || msg.includes("leave") || msg.includes("escape")) {
      return {
        text: "There are safe places available:\n\n• People Opposed to Woman Abuse (POWA): 011 642 4345\n• Saartjie Baartman Centre: 021 633 5287\n• Thuthuzela Care Centres available nationwide\n• Most areas have temporary safe shelters\n\nWould you like help finding a shelter near you?",
        type: "shelter_support",
        resources: ["shelters", "safe_houses"]
      };
    }

    // Physical health and medical care
    if (msg.includes("medical") || msg.includes("doctor") || msg.includes("hospital") || 
        msg.includes("pregnant") || msg.includes("health") || msg.includes("injured") ||
        msg.includes("pain") || msg.includes("wound")) {
      return {
        text: "Medical care is important:\n\n• Go to any government clinic or hospital for free care\n• Thuthuzela Care Centres provide specialized GBV medical care\n• Post-exposure prophylaxis (PEP) for HIV prevention is available within 72 hours\n• Emergency contraception is available\n\nDo you need information about specific medical services?",
        type: "medical_support",
        resources: ["medical_care", "pep", "contraception"]
      };
    }

    // Financial support
    if (msg.includes("money") || msg.includes("financial") || msg.includes("job") || 
        msg.includes("work") || msg.includes("bills") || msg.includes("poor") ||
        msg.includes("income") || msg.includes("unemployed")) {
      return {
        text: "Financial challenges can make situations harder:\n\n• SASSA grants may be available: 0800 601 011\n• Some NGOs provide emergency financial assistance\n• Skills development programs exist for economic empowerment\n• Temporary employment services can help find work\n\nWould you like information about applying for social grants?",
        type: "financial_support",
        resources: ["sassa", "employment"]
      };
    }

    // General support and resources
    if (msg.includes("help") || msg.includes("support") || msg.includes("resource") || 
        msg.includes("contact") || msg.includes("number") || msg.includes("hotline")) {
      return {
        text: "Here are essential GBV support contacts:\n\n🚨 EMERGENCY:\n• Police: 10111\n• Ambulance: 10177\n\n📞 SUPPORT LINES:\n• GBV Command Centre: 0800 428 428\n• Lifeline: 0861 322 322\n• Tears Foundation: 010 590 5920\n• People Opposed to Woman Abuse: 011 642 4345\n\nWhat specific type of support do you need?",
        type: "general_support",
        resources: ["all_contacts"]
      };
    }

    // Safety planning
    if (msg.includes("safety") || msg.includes("plan") || msg.includes("safe") || 
        msg.includes("dangerous") || msg.includes("scared") || msg.includes("fear")) {
      return {
        text: "Safety planning is crucial:\n\n• Identify safe areas in your home (avoid kitchens, bathrooms)\n• Keep phone charged and emergency numbers saved\n• Have a code word with trusted friends/family\n• Keep important documents and some money in an accessible place\n• Plan escape routes from your home\n\nWould you like help creating a personalized safety plan?",
        type: "safety_planning",
        resources: ["safety_plan"]
      };
    }

    // Children and family
    if (msg.includes("child") || msg.includes("children") || msg.includes("kids") || 
        msg.includes("family") || msg.includes("parent") || msg.includes("baby")) {
      return {
        text: "Protecting children is important:\n\n• Childline: 0800 055 555\n• Department of Social Development: 0800 428 428\n• Schools often have support systems\n• Children witnessing violence need special support\n\nAre you concerned about a child's safety or need support as a parent?",
        type: "family_support",
        resources: ["child_protection"]
      };
    }

    // Greetings and general conversation
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || 
        msg.includes("how are you") || msg.includes("good morning") || msg.includes("good afternoon")) {
      return {
        text: "Hello! I'm here to provide support and information about GBV resources. Whether you need emotional support, safety planning, legal information, or emergency contacts, I'm here to help. What's on your mind today?",
        type: "greeting",
        resources: []
      };
    }

    // Default response for unrecognized messages
    return {
      text: "Thank you for sharing. I'm here to support you with:\n\n• Emotional support and counseling resources\n• Safety planning and emergency contacts\n• Legal information and protection orders\n• Shelter and medical care options\n• Financial assistance information\n\nCould you tell me a bit more about what kind of support you're looking for?",
      type: "general",
      resources: []
    };
  };

  // 🔹 Send a message and bot reply
  const sendMessage = async () => {
    if (message.trim() === "") return;

    try {
      // Save user message
      await addDoc(collection(db, "messages"), {
        text: message,
        sender: auth.currentUser ? auth.currentUser.email : "Anonymous",
        timestamp: serverTimestamp(),
        type: "user"
      });

      setMessage("");
      
      // Show typing indicator
      setIsTyping(true);
      
      // Keep keyboard open and focus on input
      textInputRef.current?.focus();
      
      // Simulate typing delay
      setTimeout(async () => {
        const botResponse = generateBotReply(message);
        
        // Save bot reply
        await addDoc(collection(db, "messages"), {
          text: botResponse.text,
          sender: "Support Assistant",
          timestamp: serverTimestamp(),
          type: "bot",
          responseType: botResponse.type
        });

        setIsTyping(false);
        flatListRef.current?.scrollToEnd({ animated: true });
        
        // Keep keyboard open after bot responds
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      }, 1500);

    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  // 🔹 Format timestamp safely
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    if (timestamp instanceof Date) return timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if (timestamp.seconds)
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return "";
  };

  // 🔹 Render message item
  const renderItem = ({ item }) => {
    const isUser = auth.currentUser && item.sender === auth.currentUser.email;
    const isBot = item.sender === "Support Assistant";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? styles.userMessage
            : isBot
            ? styles.botMessage
            : styles.otherMessage,
        ]}
      >
        <Text style={styles.senderText}>
          {isUser ? "You" : isBot ? "Support Assistant" : item.sender || "Anonymous"}
        </Text>
        <Text style={[
          styles.messageText,
          isUser && styles.userMessageText
        ]}>{item.text}</Text>
        <Text style={[
          styles.timeText,
          isUser && styles.userTimeText
        ]}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  // 🔹 Render typing indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.botMessage]}>
        <Text style={styles.senderText}>Support Assistant</Text>
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
        <Text style={styles.timeText}>typing...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GBV Support Chat</Text>
        <Text style={styles.headerSubtitle}>Confidential • 24/7 Support</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={renderTypingIndicator}
        keyboardDismissMode="none" // Prevents keyboard from dismissing on scroll
        keyboardShouldPersistTaps="handled" // Better tap handling
      />

      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          placeholder="Type your message here... I'm here to help."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor="#999"
          blurOnSubmit={false} // Prevents keyboard from closing on submit
          onSubmitEditing={sendMessage} // Allows sending with enter key
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.emergencyBar}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => {
            Alert.alert(
              "Emergency Contacts",
              "🚨 Emergency Services: 10111\n🚑 Ambulance: 10177\n📞 GBV Hotline: 0800 428 428\n💙 Suicide Crisis: 0800 567 567",
              [
                { text: "Call Police", onPress: () => Linking.openURL('tel:10111') },
                { text: "GBV Hotline", onPress: () => Linking.openURL('tel:0800428428') },
                { text: "Close", style: "cancel" }
              ]
            );
          }}
        >
          <Ionicons name="warning" size={16} color="#fff" />
          <Text style={styles.emergencyButtonText}>EMERGENCY CONTACTS</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Pure white background
  },
  header: {
    backgroundColor: "#8B5FBF", // Softer purple
    padding: 15,
    paddingTop: 50,
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 5,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 15,
    borderRadius: 18,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: "#8B5FBF", // Softer purple
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    backgroundColor: "#F8F9FA",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  botMessage: {
    backgroundColor: "#F0F4FF", // Very light blue
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#E6F0FF",
  },
  senderText: {
    fontSize: 12,
    color: "#6C757D", // Medium gray
    marginBottom: 6,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    color: "#495057", // Dark gray for readability
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF", // White text on colored background
  },
  timeText: {
    fontSize: 10,
    color: "#ADB5BD", // Light gray
    alignSelf: "flex-end",
    marginTop: 6,
  },
  userTimeText: {
    color: "rgba(255,255,255,0.8)", // Semi-transparent white
  },
  typingContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6C757D",
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderColor: "#DEE2E6",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#495057",
  },
  sendButton: {
    backgroundColor: "#8B5FBF",
    borderRadius: 25,
    padding: 12,
    marginLeft: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5FBF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#CED4DA",
    shadowOpacity: 0,
  },
  emergencyBar: {
    backgroundColor: "#FF6B6B", // Softer red
    padding: 10,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  emergencyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 6,
  },
});