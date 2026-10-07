from services.retriever import retrieve_chunks

# queries = [
#     "How can the lease be terminated?",
#     "Are pets allowed?",
#     "What happens if rent is paid late?",
#     "What is the security deposit?",
#     "What is the monthly rent?"
# ]

queries = [
     "Can the landlord enter the property?",
    "What happens when the tenant abandons the property?",
    "Are there parking spaces provided?",
    "What are the rules for parking?",
    "When should the security deposit be returned?",
    "Under what conditions can money be deducted from the security deposit?"
]

for query in queries:
    print("\n" + "=" * 80)
    print("Question:", query)
    print("=" * 80)

    results = retrieve_chunks(query, user_email="test@example.com")

    for i, (doc, meta, dist) in enumerate(
        zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        )
    ):
        print(f"\nResult {i+1}")
        print("Document:", meta["document"])
        print("Distance:", round(dist, 4))
        print(doc)